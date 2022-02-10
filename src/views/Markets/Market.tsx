import React, { useEffect, useMemo, useState } from 'react'
import Config from '../../bao/lib/config'
import GraphUtil from '../../utils/graph'
import { useParams } from 'react-router-dom'
import { useMarkets } from '../../hooks/markets/useMarkets'
import {
	useBorrowBalances,
	useSupplyBalances,
} from '../../hooks/markets/useBalances'
import useBao from '../../hooks/base/useBao'
import { useExchangeRates } from '../../hooks/markets/useExchangeRates'
import { SpinnerLoader } from '../../components/Loader'
import { SubmitButton } from './components/MarketButton'
import { Badge, Col, Container, Row } from 'react-bootstrap'
import { MarketDetails, StatBlock } from './components/Stats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltipped from '../../components/Tooltipped'
import { MarketBorrowModal, MarketSupplyModal } from './components/Modals'
import styled from 'styled-components'
import { decimate, getDisplayBalance } from '../../utils/numberFormat'
import { formatAddress } from '../../utils'
import { ActiveSupportedMarket } from '../../bao/lib/types'

const Market = () => {
	const { id } = useParams()
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const bao = useBao()

	const [marketInfo, setMarketInfo] = useState<any | undefined>()

	const activeMarket = useMemo(() => {
		if (!markets) return undefined
		return markets.find((market) => market.mid === parseFloat(id))
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
				<a href="/">
					<FontAwesomeIcon icon="arrow-left" />
				</a>
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
					content={marketInfo ? marketInfo.numberOfSuppliers : <SpinnerLoader />}
				/>
				<InfoCol
					title="Number of Borrowers"
					content={marketInfo ? marketInfo.numberOfBorrowers : <SpinnerLoader />}
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

export default Market
