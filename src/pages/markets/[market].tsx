import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import { SubmitButton } from '@/components/Button/Button'
import Loader from '@/components/Loader'
import NavLink from '@/components/NavLink'
import Page from '@/components/Page'
import PageHeader from '@/components/PageHeader'
import Spacer from '@/components/Spacer'
import Tooltipped from '@/components/Tooltipped'
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
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { MarketDetails } from './components/Stats'
import { StatBlock, StatCards } from '@/components/Stats'
import Typography from '@/components/Typography'
import { StyledBadge } from '@/components/Badge'
import Link from 'next/link'

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
			<Page>
				<div className='block flex-1'>
					<Typography variant='lg' className='block flex-1'>
						<span className='float-right mt-4 text-lg'>
							<StyledBadge className='rounded-full'>
								<FontAwesomeIcon icon={activeMarket.isSynth ? faChartLine : faLandmark} />
								{activeMarket.isSynth ? 'Synthetic' : 'Collateral'}
							</StyledBadge>
						</span>
					</Typography>
				</div>
				<PageHeader icon={`/images/tokens/${activeMarket.underlyingSymbol}.png`} title={`${activeMarket.underlyingSymbol} Market`} />
				<Typography variant='lg'>
					<Link href='/markets'>
						<a>
							<FontAwesomeIcon className='mr-1 align-middle' icon={faArrowLeft} />
							<Typography variant='lg' className='inline-block'>
								Back to Markets
							</Typography>
						</a>
					</Link>
				</Typography>
				<div className='my-4 grid grid-cols-4 gap-4'>
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
					<div className='rounded-lg border border-primary-300 bg-primary-100 p-4 mb-4'>
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
			</Page>
		</>
	) : (
		<Loader />
	)
}

const HorizontalSpacer = () => {
	return <span style={{ width: '15px', display: 'inline-block' }} data-content=' ' />
}

const MarketTypeBadge = ({ isSynth }: { isSynth: boolean }) => {
	return (
		<StyledBadge>
			<FontAwesomeIcon icon={isSynth ? faChartLine : faLandmark} /> {isSynth ? 'Synthetic' : 'Collateral'}
		</StyledBadge>
	)
}

const InfoCol = ({ title, content }: InfoColParams) => {
	return (
		<Col md={6} lg={3}>
			<InfoContainer>
				<p>{title}</p>
				<span>{content}</span>
			</InfoContainer>
		</Col>
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
			<SubmitButton onClick={() => setShowModal(true)}>{market.isSynth ? 'Mint / Repay' : 'Supply / Withdraw'}</SubmitButton>
		</>
	)
}

type InfoColParams = {
	title: string
	content: any
}

const InfoContainer = styled.div`
	background: ${props => props.theme.color.primary[100]};
	border-radius: 8px;
	font-size: ${props => props.theme.fontSize.sm};
	color: ${props => props.theme.color.text[200]};
	border: ${props => props.theme.border.default};
	padding: 25px 50px;
	margin-bottom: 1rem;

	> span {
		color: ${props => props.theme.color.text[100]};
		display: block;
		font-size: ${props => props.theme.fontSize.default};
		margin-bottom: 0;
	}

	> p {
		margin-bottom: 0;
	}

	@media (max-width: ${props => props.theme.breakpoints.xl}px) {
		padding: 15px 30px;
		margin-bottom: 0.5rem;
		}
	}
`

export const StyledLink = styled(NavLink)`
	color: ${props => props.theme.color.text[100]};
	font-weight: ${props => props.theme.fontWeight.medium};
	padding-left: ${props => props.theme.spacing[3]}px;
	padding-right: ${props => props.theme.spacing[3]}px;
	text-decoration: none;

	&:hover {
		color: ${props => props.theme.color.text[300]};
	}

	&.active {
		color: ${props => props.theme.color.text[300]};
	}

	@media (max-width: ${props => props.theme.breakpoints.sm}px) {
		padding-left: ${props => props.theme.spacing[2]}px;
		padding-right: ${props => props.theme.spacing[2]}px;
	}
`
export const MarketDetailsContainer = styled.div`
	background: ${props => props.theme.color.primary[100]};
	padding: 16px;
	border: ${props => props.theme.border.default};
	border-radius: ${props => props.theme.borderRadius}px;
`
export const MarketHeader = styled.div`
	flex: 1 1 0%;
	display: block;

	p {
		display: block;
		flex: 1 1 0%;
	}
`

const BackButtonText = styled.span`
	@media (max-width: ${props => props.theme.breakpoints.md}px) {
		font-size: 1rem;
	}
`

export default Market
