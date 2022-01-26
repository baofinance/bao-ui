import React, { useEffect, useMemo, useState } from 'react'
import Config from '../../bao/lib/config'
import GraphUtil from '../../utils/graph'
import { useParams } from 'react-router-dom'
import { useMarkets } from '../../hooks/hard-synths/useMarkets'
import {
	useBorrowBalances,
	useSupplyBalances,
} from '../../hooks/hard-synths/useBalances'
import useBao from '../../hooks/useBao'
import { useMarketPrices } from '../../hooks/hard-synths/usePrices'
import { useExchangeRates } from '../../hooks/hard-synths/useExchangeRates'
import { SpinnerLoader } from '../../components/Loader'
import { SubmitButton } from './components/MarketButton'
import { Badge, Col, Container, Row } from 'react-bootstrap'
import { MarketDetails, StatBlock } from './components/Stats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltipped from '../../components/Tooltipped'
import { MarketBorrowModal, MarketSupplyModal } from './components/Modals'
import styled from 'styled-components'
import { decimate, getDisplayBalance } from '../../utils/numberFormat'
import { SupportedMarket } from '../../bao/lib/types'

const Market = () => {
	const { id } = useParams()
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const { prices } = useMarketPrices()
	const bao = useBao()

	const [marketInfo, setMarketInfo] = useState<any | undefined>()

	const activeMarket = useMemo(() => {
		if (!markets) return undefined
		return markets.find((market) => market.mid === parseFloat(id))
	}, [markets])

	// TODO- Use subgraph info
	useEffect(() => {
		if (!activeMarket) return

		GraphUtil.getMarketInfo(activeMarket.token).then((_marketInfo) =>
			setMarketInfo(_marketInfo.market),
		)
	}, [activeMarket])

	const supplied = useMemo(() => {
		if (!(activeMarket && supplyBalances && exchangeRates)) return
		return (
			supplyBalances.find(
				(balance) =>
					balance.address.toLowerCase() === activeMarket.token.toLowerCase(),
			).balance * decimate(exchangeRates[activeMarket.token]).toNumber()
		)
	}, [activeMarket, supplyBalances, exchangeRates])

	const totalSuppliedUSD = useMemo(() => {
		if (!(activeMarket && prices)) return
		return (
			activeMarket.supplied *
			decimate(
				prices[activeMarket.token],
				36 - activeMarket.decimals,
			).toNumber()
		)
	}, [activeMarket, prices])

	const borrowed = useMemo(() => {
		if (!(activeMarket && borrowBalances)) return
		return borrowBalances.find(
			(balance) =>
				balance.address.toLowerCase() === activeMarket.token.toLowerCase(),
		).balance
	}, [activeMarket, borrowBalances])

	const totalBorrowedUSD = useMemo(() => {
		if (!(activeMarket && prices)) return
		return (
			activeMarket.totalBorrows *
			decimate(
				prices[activeMarket.token],
				36 - activeMarket.decimals,
			).toNumber()
		)
	}, [activeMarket, prices])

	const oracleAddress = useMemo(() => {
		if (!bao) return
		const address = bao.getContract('marketOracle').options.address
		return `${address.slice(0, 6)}...${address.slice(
			address.length - 4,
			address.length,
		)}`
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
									? getDisplayBalance(
											supplied *
												decimate(
													prices[activeMarket.token],
													36 - activeMarket.decimals,
												).toNumber(),
											0,
									  )
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
									? getDisplayBalance(
											borrowed *
												decimate(
													prices[activeMarket.token],
													36 - activeMarket.decimals,
												).toNumber(),
											0,
									  )
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
					content={marketInfo && marketInfo.numberOfSuppliers}
				/>
				<InfoCol
					title="Number of Borrowers"
					content={marketInfo && marketInfo.numberOfBorrowers}
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
			<InfoCol
				title={null}
				content={
					<ActionButton market={activeMarket} isSynth={activeMarket.isSynth} />
				}
			/>
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

const MarketTypeBadge = ({ isSynth }: IsSynthProps) => {
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

const ActionButton = ({ market, isSynth }: IsSynthProps) => {
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			{isSynth ? (
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
				{isSynth ? 'Mint / Repay' : 'Supply / Withdraw'}
			</SubmitButton>
		</>
	)
}

type IsSynthProps = {
	market?: SupportedMarket
	isSynth: boolean
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
