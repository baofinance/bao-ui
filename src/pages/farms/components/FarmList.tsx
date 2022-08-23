import Config from '@/bao/lib/config'
import { getMasterChefContract } from '@/bao/utils'
import Loader, { SpinnerLoader } from '@/components/Loader'
import { StyledLoadingWrapper } from '@/components/Loader/Loader'
import Spacer from '@/components/Spacer'
import Typography from '@/components/Typography'
import { Farm, PoolType } from '@/contexts/Farms/types'
import { classNames } from '@/functions/styling'
import useBao from '@/hooks/base/useBao'
import useAllFarmTVL from '@/hooks/farms/useAllFarmTVL'
import useFarms from '@/hooks/farms/useFarms'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import { decimate, getDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { Switch } from '@headlessui/react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { FarmModal } from './Modals'

const FarmList: React.FC = () => {
	const bao = useBao()
	const [farms] = useFarms()
	const farmsTVL = useAllFarmTVL(bao, bao && bao.multicall)
	const { account } = useWeb3React()

	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const [pools, setPools] = useState<any | undefined>({
		[PoolType.ACTIVE]: [],
		[PoolType.ARCHIVED]: [],
	})

	const tempAddress = '0x0000000000000000000000000000000000000000'

	const userAddress = account ? account : tempAddress

	const BLOCKS_PER_YEAR = new BigNumber(2336000)

	const [archived, showArchived] = useState(false)

	useEffect(() => {
		GraphUtil.getPrice(Config.addressMap.WETH).then(async wethPrice => {
			const baoPrice = await GraphUtil.getPriceFromPair(wethPrice, Config.contracts.bao[Config.networkId].address)
			setBaoPrice(baoPrice)
		})

		const _pools: any = {
			[PoolType.ACTIVE]: [],
			[PoolType.ARCHIVED]: [],
		}
		if (!(farmsTVL && bao)) return setPools(_pools)

		bao.multicall
			.call(
				Multicall.createCallContext([
					{
						ref: 'masterChef',
						contract: getMasterChefContract(bao),
						calls: farms
							.map((farm, i) => {
								return {
									ref: i.toString(),
									method: 'getNewRewardPerBlock',
									params: [farm.pid + 1],
								}
							})
							.concat(
								farms.map((farm, i) => {
									return {
										ref: (farms.length + i).toString(),
										method: 'userInfo',
										params: [farm.pid, userAddress],
									}
								}) as any,
							),
					},
				]),
			)
			.then(async (_result: any) => {
				const result = await Multicall.parseCallResults(_result)

				for (let i = 0; i < farms.length; i++) {
					const farm = farms[i]
					const tvlInfo = farmsTVL.tvls.find((fTVL: any) => fTVL.lpAddress.toLowerCase() === farm.lpTokenAddress.toLowerCase())
					const farmWithStakedValue = {
						...farm,
						poolType: farm.poolType || PoolType.ACTIVE,
						tvl: tvlInfo.tvl,
						stakedUSD: decimate(result.masterChef[farms.length + i].values[0].hex)
							.div(decimate(tvlInfo.lpStaked))
							.times(tvlInfo.tvl),
						apy:
							baoPrice && farmsTVL
								? baoPrice
										.times(BLOCKS_PER_YEAR)
										.times(new BigNumber(result.masterChef[i].values[0].hex).div(10 ** 18))
										.div(tvlInfo.tvl)
								: null,
					}

					_pools[farmWithStakedValue.poolType].push(farmWithStakedValue)
				}
				setPools(_pools)
			})
	}, [farmsTVL, bao])

	return (
		<>
			{/* <Form.Check
					inline
					type="switch"
					id="show-archived"
					label="Show Staked Only"
					checked={staked}
					onChange={(e) => showStaked(e.currentTarget.checked)}
				/> */}
			<div className='container flex justify-end opacity-50'>
				<Switch.Group as='div' className='flex items-center'>
					<Switch
						disabled={true}
						checked={archived}
						onChange={showArchived}
						className={classNames(
							archived ? 'bg-text-100' : 'bg-text-100',
							'border-transparent relative inline-flex h-[14px] w-[28px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
						)}
					>
						<span
							aria-hidden='true'
							className={classNames(
								archived ? 'translate-x-[14px]' : 'translate-x-0',
								'pointer-events-none inline-block h-[10px] w-[10px] transform rounded-full bg-text-300 shadow ring-0 transition duration-200 ease-in-out',
							)}
						/>
					</Switch>
					<Switch.Label as='span' className='ml-3'>
						<Typography variant='sm'>Show Archived Farms</Typography>
					</Switch.Label>
				</Switch.Group>
			</div>
			<div className='flex w-full flex-row'>
				<div className='flex w-full flex-col'>
					<FarmListHeader headers={['Pool', 'APR', 'LP Staked', 'TVL']} />
					{!archived ? (
						<>
							{pools[PoolType.ACTIVE].length ? (
								pools[PoolType.ACTIVE].map((farm: any, i: number) => (
									<React.Fragment key={i}>
										<FarmListItem farm={farm} />
									</React.Fragment>
								))
							) : (
								<StyledLoadingWrapper>
									<Loader />
								</StyledLoadingWrapper>
							)}
						</>
					) : (
						<>
							{pools[PoolType.ARCHIVED].length ? (
								pools[PoolType.ARCHIVED].map((farm: any, i: number) => (
									<React.Fragment key={i}>
										<FarmListItem farm={farm} />
									</React.Fragment>
								))
							) : (
								<StyledLoadingWrapper>
									<Loader />
								</StyledLoadingWrapper>
							)}
						</>
					)}
				</div>
			</div>
		</>
	)
}

type FarmListHeaderProps = {
	headers: string[]
}

const FarmListHeader: React.FC<FarmListHeaderProps> = ({ headers }: FarmListHeaderProps) => {
	return (
		<div className='container'>
			<div className='flex flex-row px-2 py-3'>
				{headers.map((header: string) => (
					<div className='flex w-full basis-1/4 flex-col pb-0 text-right font-bold first:text-left' key={header}>
						{header}
					</div>
				))}
			</div>
		</div>
	)
}

export interface FarmWithStakedValue extends Farm {
	apy: BigNumber
	stakedUSD: BigNumber
}

interface FarmListItemProps {
	farm: FarmWithStakedValue
}

const FarmListItem: React.FC<FarmListItemProps> = ({ farm }) => {
	const { account } = useWeb3React()

	const [showFarmModal, setShowFarmModal] = useState(false)

	return (
		<>
			<button className='w-full py-2' onClick={() => setShowFarmModal(true)} disabled={!account}>
				<div className='rounded-lg border border-primary-300 bg-primary-100 p-4 text-text-100 hover:bg-primary-200'>
					<div className='flex w-full flex-row'>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-left'>
							<div className='mx-0 my-auto inline-block h-full items-center align-middle text-text-100'>
								<img className='z-10 inline-block h-8 w-8 select-none duration-200' src={farm.iconA} />
								<img className='z-20 -ml-2 inline-block h-8 w-8 select-none duration-200' src={farm.iconB} />
								<Typography className='ml-2 inline-block font-semibold'>{farm.name}</Typography>
							</div>
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							{farm.apy ? (
								farm.apy.gt(0) ? (
									`${farm.apy.times(new BigNumber(100)).toNumber().toLocaleString('en-US').slice(0, -1)}%`
								) : (
									'N/A'
								)
							) : (
								<SpinnerLoader />
							)}
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							{account ? `$${window.screen.width > 1200 ? getDisplayBalance(farm.stakedUSD, 0) : truncateNumber(farm.stakedUSD, 0)}` : '-'}
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							${window.screen.width > 1200 ? getDisplayBalance(farm.tvl, 0) : truncateNumber(farm.tvl, 0)}
						</div>
					</div>
				</div>
			</button>
			<FarmModal farm={farm} show={showFarmModal} onHide={() => setShowFarmModal(false)} />
		</>
	)
}

export default FarmList
