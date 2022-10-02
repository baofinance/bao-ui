import { ActiveSupportedMarket } from '@/bao/lib/types'
import { ListHeader } from '@/components/List'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Accordion, AccordionHeader } from '@material-tailwind/react/components/Accordion'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { isDesktop } from 'react-device-detect'

export const OfflineMarketList: React.FC<MarketListProps> = ({ markets }: MarketListProps) => {
	const collateralMarkets = useMemo(() => {
		if (!markets) return []
		return markets.filter(market => !market.isSynth)
	}, [markets])

	const synthMarkets = useMemo(() => {
		if (!markets) return []
		return markets.filter(market => market.isSynth)
	}, [markets])

	return (
		<>
			{markets ? (
				<div className={`flex ${isDesktop ? 'flex-row gap-12' : 'mt-4 flex-col gap-4'}`}>
					<div className='flex w-full flex-col'>
						<Typography variant='xl' className='text-center'>
							Collateral
						</Typography>
						<ListHeader headers={['Asset', 'Liquidity']} />
						{collateralMarkets.map((market: ActiveSupportedMarket) => (
							<OfflineListItemCollateral market={market} key={market.marketAddress} />
						))}
					</div>
					<div className='flex w-full flex-col'>
						<Typography variant='xl' className='text-center'>
							Synthetics
						</Typography>
						<ListHeader headers={['Asset', 'APR', 'Wallet']} />
						{synthMarkets.map((market: ActiveSupportedMarket) => (
							<OfflineListItemSynth market={market} key={market.marketAddress} />
						))}
					</div>
				</div>
			) : (
				<PageLoader block />
			)}
		</>
	)
}

const OfflineListItemCollateral: React.FC<MarketListItemProps> = ({ market }: MarketListItemProps) => {
	return (
		<>
			<Accordion open={false} className='my-2 rounded border border-primary-300'>
				<AccordionHeader className={`cursor-default rounded border-0 bg-primary-100 p-3 hover:bg-primary-200`}>
					<div className='flex w-full flex-row items-center justify-center'>
						<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
							<Image
								src={`/images/tokens/${market.icon}`}
								alt={market.underlyingSymbol}
								width={32}
								height={32}
								className='inline-block select-none'
							/>
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-medium leading-5'>{market.underlyingSymbol}</Typography>
							</span>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{`$${getDisplayBalance(market.supplied * market.price - market.totalBorrows * market.price, 0, 0)}`}
								</span>
							</Typography>
						</div>
					</div>
				</AccordionHeader>
			</Accordion>
		</>
	)
}

const OfflineListItemSynth: React.FC<MarketListItemProps> = ({ market }: MarketListItemProps) => {
	return (
		<>
			<Accordion open={false} className='my-2 rounded border border-primary-300'>
				<AccordionHeader className={`cursor-default rounded border-0 bg-primary-100 p-3 hover:bg-primary-200`}>
					<div className='flex w-full flex-row items-center justify-center'>
						<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
							<Image
								src={`/images/tokens/${market.icon}`}
								alt={`${market.underlyingSymbol}`}
								width={32}
								height={32}
								className='inline-block select-none'
							/>
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-medium leading-5'>{market.underlyingSymbol}</Typography>
							</span>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>{market.borrowApy.toFixed(2)}% </Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{`$${getDisplayBalance(market.supplied * market.price - market.totalBorrows * market.price, 0, 0)}`}
								</span>
							</Typography>
						</div>
					</div>
				</AccordionHeader>
			</Accordion>
		</>
	)
}

export default OfflineMarketList

type MarketListProps = {
	markets: ActiveSupportedMarket[]
}

type MarketListItemProps = {
	market: ActiveSupportedMarket
	accountMarkets?: ActiveSupportedMarket[]
}
