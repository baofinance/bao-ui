import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Config from 'bao/lib/config'
import { ActiveSupportedMarket } from 'bao/lib/types'
import { SpinnerLoader } from 'components/Loader'
import Tooltipped from 'components/Tooltipped'
import useBao from 'hooks/base/useBao'
import { useBorrowBalances, useSupplyBalances } from 'hooks/markets/useBalances'
import { useExchangeRates } from 'hooks/markets/useExchangeRates'
import { useMarkets } from 'hooks/markets/useMarkets'
import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Col, Container, Row } from 'react-bootstrap'
import { NavLink, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { formatAddress } from 'utils'
import GraphUtil from 'utils/graph'
import { decimate, getDisplayBalance } from 'utils/numberFormat'
import { SubmitButton } from './components/MarketButton'
import { MarketBorrowModal, MarketSupplyModal } from './components/Modals'
import { MarketDetails, StatBlock } from './components/Stats'

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
		return markets.find((market) => market.mid === parseFloat(marketId))
	}, [markets])

	// TODO- Use subgraph info for other stats
	useEffect(() => {
		if (!activeMarket) return

		GraphUtil.getMarketInfo(activeMarket.marketAddress).then((_marketInfo) =>
			setMarketInfo(_marketInfo.market),
		)
	}, [activeMarket])

	const supplied = useMemo(() => {
		if (!(activeMarket && supplyBalances && exchangeRates)) return
		return (
			supplyBalances.find(
				(balance) =>
					balance.address.toLowerCase() ===
					activeMarket.marketAddress.toLowerCase(),
			).balance * decimate(exchangeRates[activeMarket.marketAddress]).toNumber()
		)
	}, [activeMarket, supplyBalances, exchangeRates])

	const totalSuppliedUSD = useMemo(() => {
		if (!activeMarket) return
		return activeMarket.supplied * activeMarket.price
	}, [activeMarket])

	const borrowed = useMemo(() => {
		if (!(activeMarket && borrowBalances)) return
		return borrowBalances.find(
			(balance) =>
				balance.address.toLowerCase() ===
				activeMarket.marketAddress.toLowerCase(),
		).balance
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
		<Container style={{ marginTop: '2.5em' }}>
			<h3>
				<StyledLink exact activeClassName="active" to={{ pathname: '/' }}>
					<FontAwesomeIcon icon="arrow-left" />
				</StyledLink>
				<HorizontalSpacer />
				Back to Markets
				<span style={{ float: 'right' }}>
					<img
						src={activeMarket.icon}
						style={{ height: '1.75rem', verticalAlign: 'middle' }}
					/>
					<HorizontalSpacer />
					{activeMarket.underlyingSymbol}
					<HorizontalSpacer />
					<MarketTypeBadge isSynth={activeMarket.isSynth} />
				</span>
			</h3>
			<br />
			<Row>
				<InfoCol
					title="Total Supplied"
					content={
						<Tooltipped content={`$${getDisplayBalance(totalSuppliedUSD, 0)}`}>
							<a>
								<FontAwesomeIcon icon="level-down-alt" />{' '}
								{getDisplayBalance(activeMarket.supplied, 0)}{' '}
								{activeMarket.underlyingSymbol}
							</a>
						</Tooltipped>
					}
				/>
				<InfoCol
					title="Total Debt"
					content={
						<Tooltipped content={`$${getDisplayBalance(totalBorrowedUSD, 0)}`}>
							<a>
								<FontAwesomeIcon icon="level-down-alt" />{' '}
								{getDisplayBalance(activeMarket.totalBorrows, 0)}{' '}
								{activeMarket.underlyingSymbol}
							</a>
						</Tooltipped>
					}
				/>
				<InfoCol
					title="APY"
					content={`${activeMarket.supplyApy.toFixed(2)}%`}
				/>
				<InfoCol
					title="APR"
					content={`${activeMarket.borrowApy.toFixed(2)}%`}
				/>
			</Row>
			<br />
			<Row>
				<InfoCol
					title="Your Supply"
					content={
						<Tooltipped
							content={`$${
								supplied
									? getDisplayBalance(supplied * activeMarket.price, 0)
									: '0'
							}`}
						>
							<a>
								<FontAwesomeIcon icon="level-down-alt" />{' '}
								{supplied ? supplied.toFixed(4) : '0'}{' '}
								{activeMarket.underlyingSymbol}
							</a>
						</Tooltipped>
					}
				/>
				<InfoCol
					title="Your Debt"
					content={
						<Tooltipped
							content={`$${
								borrowed
									? getDisplayBalance(borrowed * activeMarket.price, 0)
									: '0'
							}`}
						>
							<a>
								<FontAwesomeIcon icon="level-down-alt" />{' '}
								{borrowed ? borrowed.toFixed(4) : '0'}{' '}
								{activeMarket.underlyingSymbol}
							</a>
						</Tooltipped>
					}
				/>
				<InfoCol
					title="Number of Suppliers"
					content={
						marketInfo ? marketInfo.numberOfSuppliers : <SpinnerLoader />
					}
				/>
				<InfoCol
					title="Number of Borrowers"
					content={
						marketInfo ? marketInfo.numberOfBorrowers : <SpinnerLoader />
					}
				/>
			</Row>
			<br />
			<InfoCol
				title="Market Details (cont.d)"
				content={
					<>
						<Row>
							<Col>
								<MarketDetails asset={activeMarket} />
							</Col>
							<Col>
								<StatBlock
									label={null}
									stats={[
										{
											label: 'Market Utilization',
											value: `${(
												(activeMarket.totalBorrows /
													(activeMarket.supplied +
														activeMarket.totalBorrows -
														activeMarket.totalReserves)) *
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
												<a
													href={`${
														Config.defaultRpc.blockExplorerUrls[0]
													}/address/${
														bao.getContract('marketOracle').options.address
													}`}
												>
													{oracleAddress}{' '}
													<FontAwesomeIcon icon="external-link-alt" />
												</a>
											),
										},
									]}
								/>
							</Col>
						</Row>
						<br />
					</>
				}
			/>
			<br />
			<InfoCol title={null} content={<ActionButton market={activeMarket} />} />
		</Container>
	) : (
		<SpinnerLoader block />
	)
}

const HorizontalSpacer = () => {
	return (
		<span style={{ width: '15px', display: 'inline-block' }} data-content=" " />
	)
}

const MarketTypeBadge = ({ isSynth }: { isSynth: boolean }) => {
	return (
		<Badge pill bg="secondary">
			<FontAwesomeIcon icon={isSynth ? 'chart-line' : 'landmark'} />{' '}
			{isSynth ? 'Synthetic' : 'Collateral'}
		</Badge>
	)
}

const InfoCol = ({ title, content }: InfoColParams) => {
	return (
		<Col>
			<InfoContainer>
				<span>{title}</span>
				<p>{content}</p>
			</InfoContainer>
		</Col>
	)
}

const ActionButton = ({ market }: { market: ActiveSupportedMarket }) => {
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			{market.isSynth ? (
				<MarketBorrowModal
					asset={market}
					show={showModal}
					onHide={() => setShowModal(false)}
				/>
			) : (
				<MarketSupplyModal
					asset={market}
					show={showModal}
					onHide={() => setShowModal(false)}
				/>
			)}
			<SubmitButton onClick={() => setShowModal(true)}>
				{market.isSynth ? 'Mint / Repay' : 'Supply / Withdraw'}
			</SubmitButton>
		</>
	)
}

type InfoColParams = {
	title: string
	content: any
}

const InfoContainer = styled.div`
	background: ${(props) => props.theme.color.primary[100]};
	border-radius: 12px;
	padding: 25px 50px;
	font-size: 14px;
	color: ${(props) => props.theme.color.text[200]};

	> p {
		color: ${(props) => props.theme.color.text[100]};
		display: block;
		font-size: 130%;
		margin-bottom: 0;
	}
`

export const StyledLink = styled(NavLink)`
	color: ${(props) => props.theme.color.text[100]};
	font-weight: ${(props) => props.theme.fontWeight.medium};
	padding-left: ${(props) => props.theme.spacing[3]}px;
	padding-right: ${(props) => props.theme.spacing[3]}px;
	text-decoration: none;
	&:hover {
		color: ${(props) => props.theme.color.text[300]};
	}
	&.active {
		color: ${(props) => props.theme.color.text[300]};
	}
	@media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
		padding-left: ${(props) => props.theme.spacing[2]}px;
		padding-right: ${(props) => props.theme.spacing[2]}px;
	}
`

export default Market
