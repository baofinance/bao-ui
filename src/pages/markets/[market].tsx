import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button/Button'
import Loader, { PageLoader } from '@/components/Loader'
import { StatBlock, StatCards } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { useMarkets } from '@/hooks/markets/useMarkets'
import formatAddress from '@/utils/formatAddress'
import GraphUtil from '@/utils/graph'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft, faChartLine, faExternalLinkAlt, faLandmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import MarketBorrowModal from './components/Modals/BorrowModal'
import MarketSupplyModal from './components/Modals/SupplyModal'
import { MarketDetails } from './components/Stats'

export async function getStaticPaths() {
	return {
		paths: [
			{ params: { market: 'ETH' } },
			{ params: { market: 'USDC' } },
			{ params: { market: 'bSTBL' } },
			{ params: { market: 'baoUSD' } },
		],
		fallback: false, // can also be true or 'blocking'
	}
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps({ params }: { params: { market: string } }) {
	const { market } = params

	return {
		props: {
			marketId: market,
		},
	}
}

const Market: NextPage<{
	marketId: string
}> = ({ marketId }) => {
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const { chainId } = useWeb3React()

	const [marketInfo, setMarketInfo] = useState<any | undefined>()

	const activeMarket = useMemo(() => {
		if (!markets) return undefined
		return markets.find(market => market.underlyingSymbol === marketId)
	}, [marketId, markets])

	// TODO- Use subgraph info for other stats
	useEffect(() => {
		if (!activeMarket) return

		GraphUtil.getMarketInfo(activeMarket.marketAddress).then(_marketInfo => setMarketInfo(_marketInfo.market))
	}, [activeMarket])

	const supplied = useMemo(() => {
		if (!(activeMarket && supplyBalances && exchangeRates)) return
		const bal = supplyBalances.find(balance => balance.address.toLowerCase() === activeMarket.marketAddress.toLowerCase()).balance
		return decimate(bal.mul(exchangeRates[activeMarket.marketAddress]))
	}, [activeMarket, supplyBalances, exchangeRates])

	const totalSuppliedUSD = useMemo(() => {
		if (!activeMarket) return
		return decimate(activeMarket.supplied.mul(activeMarket.price))
	}, [activeMarket])

	const borrowed = useMemo(() => {
		if (!(activeMarket && borrowBalances)) return
		return borrowBalances.find(balance => balance.address.toLowerCase() === activeMarket.marketAddress.toLowerCase()).balance
	}, [activeMarket, borrowBalances])

	const totalBorrowedUSD = useMemo(() => {
		if (!activeMarket) return
		return decimate(activeMarket.totalBorrows.mul(activeMarket.price))
	}, [activeMarket])

	const oracleAddress = useMemo(() => {
		if (!chainId) return
		const address = Config.contracts.MarketOracle[chainId].address
		return address
	}, [chainId])

	return markets && activeMarket ? (
		<>
			<NextSeo title={`${marketId} Market`} description={`Supply or withdraw ${activeMarket.underlyingSymbol} collateral.`} />
			<div className='mt-6 flex items-center'>
				<Typography variant='lg' className='float-left items-center'>
					<Link href='/'>
						<a className='hover:text-text-400'>
							<FontAwesomeIcon className='mr-1' icon={faArrowLeft} size='sm' />
							<Typography variant='lg' className='inline-block font-medium'>
								Back to Markets
							</Typography>
						</a>
					</Link>
				</Typography>
				<Typography variant='lg' className='block flex-1 items-center'>
					<span className='float-right items-center'>
						<Image
							src={`/images/tokens/${activeMarket.underlyingSymbol}.png`}
							alt={activeMarket.underlyingSymbol}
							height={32}
							width={32}
							className='inline'
						/>
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
									<a>{getDisplayBalance(activeMarket.supplied)} </a>
								</Tooltipped>
							),
						},
						{
							label: `Total ${activeMarket.underlyingSymbol} Debt`,
							value: (
								<Tooltipped content={`$${getDisplayBalance(totalBorrowedUSD, 0)}`}>
									<a>{getDisplayBalance(activeMarket.totalBorrows)} </a>
								</Tooltipped>
							),
						},
						{
							label: `APY`,
							value: `${getDisplayBalance(activeMarket.supplyApy)}%`,
						},
						{
							label: `APR`,
							value: `${getDisplayBalance(activeMarket.borrowApy)}%`,
						},
						{
							label: `Your ${activeMarket.underlyingSymbol} Supply`,
							value: (
								<Tooltipped content={`$${supplied ? getDisplayBalance(supplied.mul(activeMarket.price)) : '0'}`}>
									<a>{supplied ? getDisplayBalance(supplied) : '0'} </a>
								</Tooltipped>
							),
						},
						{
							label: `Your ${activeMarket.underlyingSymbol} Debt`,
							value: (
								<Tooltipped content={`$${borrowed ? getDisplayBalance(borrowed.mul(activeMarket.price)) : '0'}`}>
									<a>{borrowed ? getDisplayBalance(borrowed) : '0'} </a>
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
				<div className='mb-4 rounded border border-primary-300 bg-primary-100 p-4'>
					<MarketDetails asset={activeMarket} />
					<StatBlock
						stats={[
							{
								label: 'Market Utilization',
								value: `${
									activeMarket &&
									(
										(parseFloat(formatUnits(activeMarket.totalBorrows)) /
											(parseFloat(formatUnits(activeMarket.supplied)) +
												parseFloat(formatUnits(activeMarket.totalBorrows)) -
												parseFloat(formatUnits(activeMarket.totalReserves)))) *
										100
									).toFixed(2)
								}%`,
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
									<a href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${oracleAddress}`} className='hover:text-text-400'>
										{formatAddress(oracleAddress)} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
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
		<PageLoader block />
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
