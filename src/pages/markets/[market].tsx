import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button/Button'
import Loader from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import { StatBlock, StatCards } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { useMarkets } from '@/hooks/markets/useMarkets'
import GraphUtil from '@/utils/graph'
import { formatAddress } from '@/utils/index'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft, faChartLine, faExternalLinkAlt, faLandmark, faLevelDownAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { MarketDetails } from './components/Stats'
import Image from 'next/future/image'
import { isDesktop } from 'react-device-detect'

const MarketSupplyModal = React.lazy(() => import('./components/Modals/SupplyModal'))
const MarketBorrowModal = React.lazy(() => import('./components/Modals/BorrowModal'))

const Market: React.FC = () => {
	const router = useRouter()
	const marketId = router.query.market
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const bao = useBao()

	const [marketInfo, setMarketInfo] = useState<any | undefined>()

	const activeMarket = useMemo(() => {
		if (!markets) return undefined
		return markets.find(market => market.underlyingSymbol === marketId)
	}, [markets])

	// TODO- Use subgraph info for other stats
	useEffect(() => {
		if (!activeMarket) return

		GraphUtil.getMarketInfo(activeMarket.marketAddress).then(_marketInfo => setMarketInfo(_marketInfo.market))
	}, [activeMarket])

	const supplied = useMemo(() => {
		if (!(activeMarket && supplyBalances && exchangeRates)) return
		return (
			supplyBalances.find(balance => balance.address.toLowerCase() === activeMarket.marketAddress.toLowerCase()).balance *
			decimate(exchangeRates[activeMarket.marketAddress]).toNumber()
		)
	}, [activeMarket, supplyBalances, exchangeRates])

	const totalSuppliedUSD = useMemo(() => {
		if (!activeMarket) return
		return activeMarket.supplied * activeMarket.price
	}, [activeMarket])

	const borrowed = useMemo(() => {
		if (!(activeMarket && borrowBalances)) return
		return borrowBalances.find(balance => balance.address.toLowerCase() === activeMarket.marketAddress.toLowerCase()).balance
	}, [activeMarket, borrowBalances])

	const totalBorrowedUSD = useMemo(() => {
		if (!activeMarket) return
		return activeMarket.totalBorrows * activeMarket.price
	}, [activeMarket])

	const oracleAddress = useMemo(() => {
		if (!bao) return
		const address = bao.getContract('marketOracle').options.address
		return formatAddress(address)
	}, [bao])

	return markets && activeMarket ? (
		<>
			<NextSeo title={`${marketId} Market`} description={`Supply or withdraw ${activeMarket.underlyingSymbol} collateral.`} />
			<div className='mt-6 flex items-center'>
				<Typography variant='lg' className='float-left items-center'>
					<Link href='/markets'>
						<a>
							<FontAwesomeIcon className='mr-1' icon={faArrowLeft} size='sm' />
							<Typography variant='lg' className='inline-block'>
								Back to Markets
							</Typography>
						</a>
					</Link>
				</Typography>
				<Typography variant='lg' className='block flex-1 items-center'>
					<span className='float-right items-center'>
						<Image src={`/images/tokens/${activeMarket.underlyingSymbol}.png`} height={32} width={32} className='inline' />
						<Badge className='ml-2 rounded-full text-base'>
							<div className='p-1'>
								<FontAwesomeIcon icon={activeMarket.isSynth ? faChartLine : faLandmark} className='mr-2' />
								{activeMarket.isSynth ? 'Synthetic' : 'Collateral'}
							</div>
						</Badge>
					</span>
				</Typography>
			</div>
			<div className={`my-4 grid ${isDesktop ? 'grid-cols-4' : 'grid-cols-2'} gap-4`}>
				<StatCards
					stats={[
						{
							label: `Total ${activeMarket.underlyingSymbol} Supplied`,
							value: (
								<Tooltipped content={`$${getDisplayBalance(totalSuppliedUSD, 0)}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {getDisplayBalance(activeMarket.supplied, 0)}{' '}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `Total ${activeMarket.underlyingSymbol} Debt`,
							value: (
								<Tooltipped content={`$${getDisplayBalance(totalBorrowedUSD, 0)}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {getDisplayBalance(activeMarket.totalBorrows, 0)}{' '}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `APY`,
							value: `${activeMarket.supplyApy.toFixed(2)}%`,
						},
						{
							label: `APR`,
							value: `${activeMarket.borrowApy.toFixed(2)}%`,
						},
						{
							label: `Your ${activeMarket.underlyingSymbol} Supply`,
							value: (
								<Tooltipped content={`$${supplied ? getDisplayBalance(supplied * activeMarket.price, 0) : '0'}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {supplied ? supplied.toFixed(4) : '0'}{' '}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `Your ${activeMarket.underlyingSymbol} Debt`,
							value: (
								<Tooltipped content={`$${borrowed ? getDisplayBalance(borrowed * activeMarket.price, 0) : '0'}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {borrowed ? borrowed.toFixed(4) : '0'}{' '}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `Number of Suppliers`,
							value: marketInfo ? marketInfo.numberOfSuppliers : <Loader />,
						},
						{
							label: `Number of Borrowers`,
							value: marketInfo ? marketInfo.numberOfBorrowers : <Loader />,
						},
					]}
				/>
			</div>
			<>
				<div className='mb-4 rounded-lg border border-primary-300 bg-primary-100 p-4'>
					<MarketDetails asset={activeMarket} />
					<StatBlock
						stats={[
							{
								label: 'Market Utilization',
								value: `${(
									(activeMarket.totalBorrows / (activeMarket.supplied + activeMarket.totalBorrows - activeMarket.totalReserves)) *
									100
								).toFixed(2)}%`,
							},
							{
								label: 'Liquidation Incentive',
								value: `${activeMarket.liquidationIncentive}%`,
							},
							{
								label: 'Borrow Restricted?',
								value: `${activeMarket.borrowRestricted ? 'Yes' : 'No'}`,
							},
							{
								label: 'Price Oracle',
								value: (
									<a href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${bao.getContract('marketOracle').options.address}`}>
										{oracleAddress} <FontAwesomeIcon icon={faExternalLinkAlt} />
									</a>
								),
							},
						]}
					/>
				</div>
			</>
			<ActionButton market={activeMarket} />
		</>
	) : (
		<Loader />
	)
}

const ActionButton = ({ market }: { market: ActiveSupportedMarket }) => {
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			{market.isSynth ? (
				<MarketBorrowModal asset={market} show={showModal} onHide={() => setShowModal(false)} />
			) : (
				<MarketSupplyModal asset={market} show={showModal} onHide={() => setShowModal(false)} />
			)}
			<Button fullWidth onClick={() => setShowModal(true)}>
				{market.isSynth ? 'Mint / Repay' : 'Supply / Withdraw'}
			</Button>
		</>
	)
}

export default Market
