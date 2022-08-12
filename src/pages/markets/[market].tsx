import { faArrowLeft, faChartLine, faExternalLinkAlt, faLandmark, faLevelDownAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Config from 'bao/lib/config'
import { ActiveSupportedMarket } from 'bao/lib/types'
import { SubmitButton } from 'components/Button/Button'
import { SpinnerLoader } from 'components/Loader'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import Spacer from 'components/Spacer'
import Tooltipped from 'components/Tooltipped'
import useBao from 'hooks/base/useBao'
import { useBorrowBalances, useSupplyBalances } from 'hooks/markets/useBalances'
import { useExchangeRates } from 'hooks/markets/useExchangeRates'
import { useMarkets } from 'hooks/markets/useMarkets'
import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Col, Container, Row } from 'react-bootstrap'
import { Helmet } from 'react-helmet'
import { NavLink, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { formatAddress } from 'utils'
import GraphUtil from 'utils/graph'
import { decimate, getDisplayBalance } from 'utils/numberFormat'
import { MarketDetails, StatBlock } from './components/Stats'

const MarketSupplyModal = React.lazy(() => import('./components/Modals/SupplyModal'))
const MarketBorrowModal = React.lazy(() => import('./components/Modals/BorrowModal'))

const Market: React.FC = () => {
	const { marketId } = useParams()
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
			<Page>
				<Helmet>
					<title>Bao | {marketId} Market</title>
					<meta name='description' content={`${marketId} market details and analytics.`} />
				</Helmet>
				<Container>
					<MarketHeader>
						<p style={{ fontSize: '1.25rem' }}>
							<span style={{ float: 'right', fontSize: '1.25rem' }}>
								<MarketTypeBadge isSynth={activeMarket.isSynth} />
							</span>
						</p>
					</MarketHeader>
					<PageHeader
						icon={require(`assets/img/tokens/${activeMarket.underlyingSymbol}.png`).default}
						title={`${activeMarket.underlyingSymbol} Market`}
					/>
					<p style={{ fontSize: '1.25rem' }}>
						<StyledLink end to={{ pathname: '/' }}>
							<FontAwesomeIcon icon={faArrowLeft} /> <BackButtonText>Back to Markets</BackButtonText>
						</StyledLink>
					</p>
					<Row lg={3} md={6}>
						<InfoCol
							title={`Total ${activeMarket.underlyingSymbol} Supplied`}
							content={
								<Tooltipped content={`$${getDisplayBalance(totalSuppliedUSD, 0)}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {getDisplayBalance(activeMarket.supplied, 0)}{' '}
									</a>
								</Tooltipped>
							}
						/>
						<InfoCol
							title={`Total ${activeMarket.underlyingSymbol} Debt`}
							content={
								<Tooltipped content={`$${getDisplayBalance(totalBorrowedUSD, 0)}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {getDisplayBalance(activeMarket.totalBorrows, 0)}{' '}
									</a>
								</Tooltipped>
							}
						/>
						<InfoCol title='APY' content={`${activeMarket.supplyApy.toFixed(2)}%`} />
						<InfoCol title='APR' content={`${activeMarket.borrowApy.toFixed(2)}%`} />
					</Row>
					<Row lg={3} md={6}>
						<InfoCol
							title={`Your ${activeMarket.underlyingSymbol} Supply`}
							content={
								<Tooltipped content={`$${supplied ? getDisplayBalance(supplied * activeMarket.price, 0) : '0'}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {supplied ? supplied.toFixed(4) : '0'}{' '}
									</a>
								</Tooltipped>
							}
						/>
						<InfoCol
							title={`Your ${activeMarket.underlyingSymbol} Debt`}
							content={
								<Tooltipped content={`$${borrowed ? getDisplayBalance(borrowed * activeMarket.price, 0) : '0'}`}>
									<a>
										<FontAwesomeIcon icon={faLevelDownAlt} /> {borrowed ? borrowed.toFixed(4) : '0'}{' '}
									</a>
								</Tooltipped>
							}
						/>
						<InfoCol title='Number of Suppliers' content={marketInfo ? marketInfo.numberOfSuppliers : <SpinnerLoader />} />
						<InfoCol title='Number of Borrowers' content={marketInfo ? marketInfo.numberOfBorrowers : <SpinnerLoader />} />
					</Row>
					<>
						<MarketDetailsContainer>
							<Row>
								<Col sm={12}>
									<MarketDetails asset={activeMarket} />
									<StatBlock
										label={null}
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
								</Col>
							</Row>
						</MarketDetailsContainer>
					</>
					<Spacer />
					<ActionButton market={activeMarket} />
				</Container>
			</Page>
		</>
	) : (
		<SpinnerLoader block />
	)
}

const HorizontalSpacer = () => {
	return <span style={{ width: '15px', display: 'inline-block' }} data-content=' ' />
}

const MarketTypeBadge = ({ isSynth }: { isSynth: boolean }) => {
	return (
		<MarketBadge pill>
			<FontAwesomeIcon icon={isSynth ? faChartLine : faLandmark} /> {isSynth ? 'Synthetic' : 'Collateral'}
		</MarketBadge>
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

export const MarketBadge = styled(Badge)`
	background-color: ${props => props.theme.color.primary[100]} !important;
	border: ${props => props.theme.border.default};
`
export default Market
