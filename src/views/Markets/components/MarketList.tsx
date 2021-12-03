import React from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useMarketPrices } from '../../../hooks/hard-synths/usePrices'
import {
	Balance,
	useAccountBalances,
} from '../../../hooks/hard-synths/useBalances'
import { Accordion, Col, Row } from 'react-bootstrap'
import { SpinnerLoader } from '../../../components/Loader'
import { decimate, getDisplayBalance } from '../../../utils/numberFormat'
import { SupportedMarket } from '../../../bao/lib/types'

export const MarketList: React.FC<MarketListProps> = ({
	markets,
}: MarketListProps) => {
	const accountBalances = useAccountBalances()
	const { prices } = useMarketPrices()

	return (
		<>
			{accountBalances && prices ? (
				<>
					<MarketListHeader />
					{markets.map((market: SupportedMarket) => (
						<MarketListItem
							market={market}
							accountBalances={accountBalances}
							prices={prices}
							key={market.token}
						/>
					))}
				</>
			) : (
				<SpinnerLoader block />
			)}
		</>
	)
}

const MarketListHeader: React.FC = () => {
	const headers = [
		'Market',
		'Supply APY',
		'Total Supplied',
		'Borrow APR',
		'Total Borrowed',
		'Wallet',
	]

	return (
		<Row lg={6} style={{ padding: '0.5rem 2rem' }}>
			{headers.map((header: string) => (
				<Col style={{ padding: '0' }} key={header}>
					<b>{header}</b>
				</Col>
			))}
		</Row>
	)
}

const MarketListItem: React.FC<MarketListItemProps> = ({
	market,
	accountBalances,
	prices,
}: MarketListItemProps) => {
	return (
		<Accordion>
			<StyledAccordionItem eventKey="0">
				<StyledAccordionHeader>
					<Row lg={6} style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>{market.supplyApy.toFixed(2)}%</Col>
						<Col>
							{`$${getDisplayBalance(
								market.supplied *
									decimate(
										prices[market.token],
										new BigNumber(36).minus(market.decimals),
									).toNumber(),
								0,
							)}`}
						</Col>
						<Col>{market.borrowApy.toFixed(2)}%</Col>
						<Col>
							{`$${getDisplayBalance(
								market.totalBorrows *
									decimate(
										prices[market.token],
										new BigNumber(36).minus(market.decimals),
									).toNumber(),
								0,
							)}`}
						</Col>
						<Col>
							{`${accountBalances
								.find(
									(balance: Balance) => balance.address === market.underlying,
								)
								.balance.toFixed(4)} ${market.underlyingSymbol}`}
						</Col>
					</Row>
				</StyledAccordionHeader>
				<Accordion.Body>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
					eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
					minim veniam, quis nostrud exercitation ullamco laboris nisi ut
					aliquip ex ea commodo consequat. Duis aute irure dolor in
					reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
					pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
					culpa qui officia deserunt mollit anim id est laborum.
				</Accordion.Body>
			</StyledAccordionItem>
		</Accordion>
	)
}

type MarketListProps = {
	markets: SupportedMarket[]
}

type MarketListItemProps = {
	market: SupportedMarket
	accountBalances: Balance[]
	prices: { [key: string]: { usd: number } }
}

const StyledAccordionHeader = styled(Accordion.Header)`
	background-color: ${(props) => props.theme.color.primary[100]};
	height: 60px;

	img {
		height: 32px;
		margin-right: 0.75rem;
		vertical-align: middle;
	}

	> button {
		background-color: ${(props) => props.theme.color.primary[100]};
		color: ${(props) => props.theme.color.text[100]};
		height: 60px;

		&:hover,
		&:focus,
		&:active,
		&:not(.collapsed) {
			background-color: ${(props) => props.theme.color.primary[200]};
			color: ${(props) => props.theme.color.text[100]};
			box-shadow: none;
		}

		&:not(.collapsed) {
			border-bottom: 2px solid ${(props) => props.theme.color.primary[300]};
			transition: none;

			&:focus,
			&:active {
				border-color: ${(props) => props.theme.color.primary[300]};
			}

			::after {
				// don't turn arrow blue
				background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23212529'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
			}
		}

		.row > .col {
			margin: auto 0;
		}
	}
`

const StyledAccordionItem = styled(Accordion.Item)`
	background-color: ${(props) => props.theme.color.primary[200]};
	margin-bottom: 1em;
	border-color: transparent;
`
