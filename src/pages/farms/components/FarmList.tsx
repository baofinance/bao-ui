import { Switch } from '@headlessui/react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'

import Config from '@/bao/lib/config'
import { getMasterChefContract } from '@/bao/utils'
import Loader, { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { Farm, PoolType } from '@/contexts/Farms/types'
import { classNames } from '@/functions/styling'
import useBao from '@/hooks/base/useBao'
import useAllFarmTVL from '@/hooks/farms/useAllFarmTVL'
import useFarms from '@/hooks/farms/useFarms'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import { decimate, getDisplayBalance, truncateNumber } from '@/utils/numberFormat'

import FarmModal from './Modals'

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
					const tvlInfo = farmsTVL.tvls.find((fTVL: any) => fTVL.lpAddress.toLowerCase() === farm.lpAddress.toLowerCase())
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
			<div className='flex justify-end opacity-50'>
				<Switch.Group as='div' className='flex items-center'>
					<Switch
						disabled={true}
						checked={archived}
						onChange={showArchived}
						className={classNames(
							archived ? 'bg-text-100' : 'bg-text-100',
							'border-transparent relative inline-flex h-[14px] w-[28px] flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out',
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
					{isDesktop ? (
						<FarmListHeader headers={['Pool', 'APR', 'LP Staked', 'TVL']} />
					) : (
						<FarmListHeader headers={['Pool', 'APR', 'Staked']} />
					)}
					{!archived ? (
						<>
							{pools[PoolType.ACTIVE].length ? (
								pools[PoolType.ACTIVE].map((farm: any, i: number) => (
									<React.Fragment key={i}>
										<FarmListItem farm={farm} />
									</React.Fragment>
								))
							) : (
								<PageLoader block />
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
								<PageLoader block />
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
		<div className='flex flex-row px-2 py-3'>
			{headers.map((header: string) => (
				<Typography variant='lg' className='flex w-full flex-col px-2 pb-0 text-right font-bold first:text-left' key={header}>
					{header}
				</Typography>
			))}
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
				<div className='rounded-lg border border-primary-300 bg-primary-100 p-4 hover:bg-primary-200'>
					<div className='flex w-full flex-row items-center'>
						<div className={`mx-auto my-0 flex ${isDesktop ? 'basis-1/4' : 'basis-1/2'} flex-col text-left`}>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 inline-block'>
									<Image className='z-10 inline-block select-none' src={farm.iconA} width={32} height={32} />
									<Image className='z-20 -ml-2 inline-block select-none' src={farm.iconB} width={32} height={32} />
								</div>
								<span className='inline-block text-left align-middle'>
									<Typography variant='base' className='font-bold'>
										{farm.name}
									</Typography>
									<Typography variant='sm' className={`font-light text-text-200`}>
										{farm.type === 'SushiSwap LP' ? (
											<Image src='/images/tokens/SUSHI.png' height={12} width={12} alt='SushiSwap' className='mr-1 inline' />
										) : (
											<Image src='/images/tokens/UNI.png' height={12} width={12} alt='Uniswap' className='mr-1 inline' />
										)}
										{farm.type}
									</Typography>
								</span>
							</div>
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							{farm.apy ? (
								<Typography variant='base' className='ml-2 inline-block font-medium'>
									{farm.apy.gt(0) ? `${farm.apy.times(new BigNumber(100)).toNumber().toLocaleString('en-US').slice(0, -1)}%` : 'N/A'}
								</Typography>
							) : (
								<Loader />
							)}
						</div>
						<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
							<Typography variant='base' className='ml-2 inline-block font-medium'>
								{account
									? `$${window.screen.width > 1200 ? getDisplayBalance(farm.stakedUSD, 0) : truncateNumber(farm.stakedUSD, 0)}`
									: '-'}
							</Typography>
						</div>
						{isDesktop && (
							<div className='mx-auto my-0 flex basis-1/4 flex-col text-right'>
								<Typography variant='base' className='ml-2 inline-block font-medium'>
									${window.screen.width > 1200 ? getDisplayBalance(farm.tvl, 0) : truncateNumber(farm.tvl, 0)}
								</Typography>
							</div>
						)}
					</div>
				</div>
			</button>
			<FarmModal farm={farm} show={showFarmModal} onHide={() => setShowFarmModal(false)} />
		</>
	)
}

export default FarmList
