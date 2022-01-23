import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMarkets } from '../../hooks/hard-synths/useMarkets'
import {
	useBorrowBalances,
	useSupplyBalances,
} from '../../hooks/hard-synths/useBalances'
import { useMarketPrices } from '../../hooks/hard-synths/usePrices'
import { SpinnerLoader } from '../../components/Loader'
import { SubmitButton } from './components/MarketButton'
import { Badge, Col, Container, Row } from 'react-bootstrap'
import { MarketDetails, StatBlock } from './components/Stats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import { decimate, getDisplayBalance } from '../../utils/numberFormat'

const Market = () => {
	const { id } = useParams()
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { prices } = useMarketPrices()

	const activeMarket = useMemo(() => {
		if (!markets) return undefined
		return markets.find((market) => market.mid === parseFloat(id))
	}, [markets])

	const supplied = useMemo(() => {
		if (!(activeMarket && supplyBalances)) return
		return supplyBalances.find(
			(balance) =>
				balance.address.toLowerCase() === activeMarket.token.toLowerCase(),
		).balance
	}, [activeMarket, supplyBalances])

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
					content={`${getDisplayBalance(activeMarket.supplied, 0)} ${
						activeMarket.underlyingSymbol
					}`}
				/>
				<InfoCol
					title="Total Debt"
					content={`${getDisplayBalance(activeMarket.totalBorrows, 0)} ${
						activeMarket.underlyingSymbol
					}`}
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
					content={`${supplied ? supplied.toFixed(4) : '0'} ${
						activeMarket.underlyingSymbol
					}`}
				/>
				<InfoCol
					title="Your Debt"
					content={`${borrowed ? borrowed.toFixed(4) : '0'} ${
						activeMarket.underlyingSymbol
					}`}
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
											label: 'Total Supplied (USD)',
											value: `$${getDisplayBalance(totalSuppliedUSD, 0)}`,
										},
										{
											label: 'Total Debt (USD)',
											value: `$${getDisplayBalance(totalBorrowedUSD, 0)}`,
										},
										{
											label: 'Market Utilization',
											value: `${(
												((activeMarket.supplied - activeMarket.totalBorrows) /
													activeMarket.supplied) *
												100
											).toFixed(2)}%`,
										},
										{
											label: 'Liquidation Incentive',
											value: `${activeMarket.liquidationIncentive}%`,
										},
									]}
								/>
							</Col>
						</Row>
						<br />
						<SubmitButton>Placeholder</SubmitButton>
					</>
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

const MarketTypeBadge = ({ isSynth }: MarketTypeBadgeParams) => {
	return (
		<Badge pill bg="secondary">
			<FontAwesomeIcon icon={isSynth ? 'chart-line' : 'landmark'} />{' '}
			{isSynth ? 'Synthetic' : 'Collateral'}
		</Badge>
	)
}

type MarketTypeBadgeParams = {
	isSynth: boolean
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

type InfoColParams = {
	title: string
	content: any
}

const InfoContainer = styled.div`
	background: ${(props) => props.theme.color.primary[100]};
	border-radius: 12px;
	padding: 25px 50px;
	font-size: 16px;
	color: #d3d3d3;

	> p {
		color: ${(props) => props.theme.color.text[100]};
		display: block;
		font-size: 130%;
		margin-bottom: 0;
	}
`

export default Market
