// FIXME: BROKEN this won't be used anymore as the /farms/ page is getting trashed!
import Config from '@/bao/lib/config'
import Loader, { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { Farm, PoolType } from '@/contexts/Farms/types'
import useBao from '@/hooks/base/useBao'
import useAllFarmTVL from '@/hooks/farms/useAllFarmTVL'
import useFarms from '@/hooks/farms/useFarms'
import { useQuery } from '@tanstack/react-query'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import { getDisplayBalance, truncateNumber, decimate, exponentiate, fromDecimal } from '@/utils/numberFormat'
import { Switch } from '@headlessui/react'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import classNames from 'classnames'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import FarmModal from './Modals'
import useContract from '@/hooks/base/useContract'
import type { Masterchef } from '@/typechain/index'

const FarmList: React.FC = () => {
	const bao = useBao()
	const farms = useFarms()
	const farmsTVL = useAllFarmTVL()
	const { account, library, chainId } = useWeb3React()

	const [pools, setPools] = useState<any | undefined>({
		[PoolType.ACTIVE]: [],
		[PoolType.ARCHIVED]: [],
	})

	const [archived, showArchived] = useState(false)

	const masterChefContract = useContract<Masterchef>('Masterchef')

	const { data: baoPrice } = useQuery(
		['GraphUtil.getPriceFromPair', { WETH: true, BAO: true }],
		async () => {
			const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
			const _baoPrice = await GraphUtil.getPriceFromPair(wethPrice, Config.contracts.Bao[chainId].address)
			return fromDecimal(_baoPrice)
		},
		{
			enabled: !!chainId,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: BigNumber.from(0),
		},
	)

	useEffect(() => {
		if (!bao || !account || !masterChefContract || !farmsTVL) return

		const _pools: any = {
			[PoolType.ACTIVE]: [],
			[PoolType.ARCHIVED]: [],
		}

		bao.multicall
			.call(
				Multicall.createCallContext([
					{
						ref: 'masterChef',
						contract: masterChefContract,
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
										params: [farm.pid, account],
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
					const BLOCKS_PER_YEAR = 2336000
					const farmWithStakedValue = {
						...farm,
						poolType: farm.poolType || PoolType.ACTIVE,
						tvl: tvlInfo.tvl,
						stakedUSD: result.masterChef[farms.length + i].values[0].div(tvlInfo.lpStaked).mul(tvlInfo.tvl),
						apy: baoPrice.gt(0) && farmsTVL ? baoPrice.mul(BLOCKS_PER_YEAR).mul(result.masterChef[i].values[0]).div(tvlInfo.tvl) : null,
					}

					_pools[farmWithStakedValue.poolType].push(farmWithStakedValue)
				}

				setPools(_pools)
			})
	}, [bao, library, masterChefContract, farms, farmsTVL, baoPrice, account, setPools])

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
				<div className='rounded border border-primary-300 bg-primary-100 p-4 hover:bg-primary-200'>
					<div className='flex w-full flex-row items-center'>
						<div className={`mx-auto my-0 flex ${isDesktop ? 'basis-1/4' : 'basis-1/2'} flex-col text-left`}>
							<div className='mx-0 my-auto inline-block h-full items-center'>
								<div className='mr-2 inline-block'>
									<Image className='z-10 inline-block select-none' src={farm.iconA} alt={farm.lpToken} width={32} height={32} />
									<Image className='z-20 -ml-2 inline-block select-none' src={farm.iconB} alt={farm.lpToken} width={32} height={32} />
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
									{farm.apy.gt(0) ? `${getDisplayBalance(farm.apy.mul(100))}%` : 'N/A'}
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
									${window.screen.width > 1200 ? getDisplayBalance(farm.tvl) : truncateNumber(farm.tvl, 0)}
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
