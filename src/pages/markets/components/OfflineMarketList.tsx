import { ActiveSupportedMarket } from '@/bao/lib/types'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Accordion, AccordionHeader } from '@material-tailwind/react'
import Image from 'next/image'
import React, { useMemo } from 'react'

export const OfflineMarketList: React.FC<MarketListProps> = ({ markets: _markets }: MarketListProps) => {
	const bao = useBao()

	const collateralMarkets = useMemo(() => {
		if (!(bao && _markets)) return
		return _markets.filter(market => !market.isSynth)
	}, [bao, _markets])

	const synthMarkets = useMemo(() => {
		if (!(bao && _markets)) return
		return _markets.filter(market => market.isSynth)
	}, [bao, _markets])

	return (
		<>
			{collateralMarkets && synthMarkets ? (
				<div className='flex flex-row gap-12'>
					<div className='flex w-full flex-col'>
						<Typography variant='h3'>Collateral</Typography>
						<ListHeader headers={['Asset', 'Liquidity']} />
						{collateralMarkets.map((market: ActiveSupportedMarket) => (
							<OfflineListItemCollateral market={market} key={market.marketAddress} />
						))}
					</div>
					<div className='flex w-full flex-col'>
						<Typography variant='h3'>Synthetics</Typography>
						<ListHeader headers={['Asset', 'APR', 'Wallet']} />
						{synthMarkets.map((market: ActiveSupportedMarket) => (
							<OfflineListItemSynth market={market} key={market.marketAddress} />
						))}
					</div>
				</div>
			) : (
				<Loader />
			)}
		</>
	)
}

const OfflineListItemCollateral: React.FC<MarketListItemProps> = ({ market }: MarketListItemProps) => {
	return (
		<>
			<Accordion open={false} className='my-2 rounded-lg border border-primary-300'>
				<AccordionHeader className='rounded-lg bg-primary-100 p-3 hover:bg-primary-200'>
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
			<Accordion open={false} className='my-2 rounded-lg border border-primary-300'>
				<AccordionHeader className='rounded-lg bg-primary-100 p-3 hover:bg-primary-200'>
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
