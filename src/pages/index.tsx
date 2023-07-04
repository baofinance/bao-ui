import Image from 'next/future/image'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import { NextSeo } from 'next-seo'
import React, { useMemo } from 'react'
import BasketList from './baskets/components/BasketList'
import { Icon } from '@/components/Icon'
import { useVaults } from '@/hooks/vaults/useVaults'
import { useSupplyBalances } from '@/hooks/vaults/useBalances'
import Badge from '@/components/Badge'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { PageLoader } from '@/components/Loader'

const Baskets: React.FC = () => {
	const vault = useVaults('baoETH')
	const supplyBalances = useSupplyBalances('baoETH')
	const collateral = useMemo(() => {
		if (!(vault && supplyBalances)) return
		return vault
			.filter(vault => !vault.isSynth)
			.sort((a, b) => {
				void a
				return supplyBalances.find(balance => balance.address.toLowerCase() === b.vaultAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [vault, supplyBalances])
	const synth = useMemo(() => {
		if (!vault) return
		return vault.find(vault => vault.isSynth)
	}, [vault])
	const vaultTVLs = collateral && collateral.map(vault => ({ tvl: vault.liquidity.mul(vault.price) }))
	const totalCollateral = useMemo(() => vaultTVLs && vaultTVLs.reduce((acc, curr) => acc.add(curr.tvl), BigNumber.from(0)), [vaultTVLs])
	const totalDebt = synth && synth.totalBorrows.mul(synth.price)

	return (
		<>
			<NextSeo title={`Dashboard`} description={`Bao Finance`} />
			{collateral && synth && supplyBalances ? (
				<div className='grid grid-cols-3 gap-24'>
					<div className='col-span-1 '>
						<Typography variant='h3' className='mb-4 text-center font-bakbak'>
							Featured Vault
						</Typography>
						<div className='glassmorphic-card grid items-center rounded px-8 py-6'>
							<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
								<Image
									src={`/images/tokens/${synth.icon}`}
									alt={`${synth.underlyingSymbol}`}
									width={40}
									height={40}
									className='inline-block select-none'
								/>
								<span className='inline-block text-left align-middle'>
									<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
										{synth.underlyingSymbol}
									</Typography>
									<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(synth.price)}</Badge>
								</span>
							</div>
							<div className='col-span-3 mx-auto my-0 flex w-full flex-row items-center justify-end align-middle'>
								<div className='grid grid-cols-4 gap-16'>
									<div className='col-span-1 break-words text-center'>
										<Typography variant='base' className='font-bakbak text-baoRed'>
											Total Debt
										</Typography>
										<Typography variant='xl' className='inline-block font-bakbak leading-5'>
											${getDisplayBalance(decimate(totalDebt), synth.underlyingDecimals)}
										</Typography>
									</div>
									<div className='col-span-1 break-words text-center'>
										<Typography variant='base' className='font-bakbak text-baoRed'>
											Total Collateral
										</Typography>
										<Typography variant='xl' className='inline-block font-bakbak leading-5'>
											${getDisplayBalance(decimate(totalCollateral), synth.underlyingDecimals)}
										</Typography>
									</div>
									<div className='col-span-1 break-words text-center'>
										<Typography variant='base' className='font-bakbak text-baoRed'>
											Utilization
										</Typography>
										<Typography variant='xl' className='inline-block font-bakbak leading-5'>
											{getDisplayBalance(totalDebt.div(decimate(totalCollateral)).mul(100))}%
										</Typography>
									</div>
									<div className='col-span-1 break-words text-center'>
										<Typography variant='base' className='font-bakbak text-baoRed'>
											Borrow Rate
										</Typography>
										<Typography variant='xl' className='inline-block font-bakbak leading-5'>
											{getDisplayBalance(synth.borrowApy, 18, 2)}%
										</Typography>
										<Typography className='ml-1 inline-block font-bakbak leading-5 text-baoWhite'>vAPY</Typography>
									</div>
								</div>
							</div>
						</div>
						<div className='col-span-1 '>
							<Typography variant='h3' className='mb-4 text-center font-bakbak'>
								Featured Basket
							</Typography>
							<div className='glassmorphic-card grid items-center rounded px-8 py-6'>
								<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
									<Image
										src={`/images/tokens/${synth.icon}`}
										alt={`${synth.underlyingSymbol}`}
										width={40}
										height={40}
										className='inline-block select-none'
									/>
									<span className='inline-block text-left align-middle'>
										<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
											{synth.underlyingSymbol}
										</Typography>
										<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(synth.price)}</Badge>
									</span>
								</div>
							</div>
						</div>
						<div className='col-span-1 '>
							<Typography variant='h3' className='mb-4 text-center font-bakbak'>
								Featured Gauge
							</Typography>
							<div className='glassmorphic-card grid items-center rounded px-8 py-6'>
								<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
									<Image
										src={`/images/tokens/${synth.icon}`}
										alt={`${synth.underlyingSymbol}`}
										width={40}
										height={40}
										className='inline-block select-none'
									/>
									<span className='inline-block text-left align-middle'>
										<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
											{synth.underlyingSymbol}
										</Typography>
										<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(synth.price)}</Badge>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<PageLoader block />
			)}
		</>
	)
}

export default Baskets
