import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useMarketPrices } from '../../../hooks/hard-synths/usePrices'
import {
	Balance,
	useAccountBalances,
	useBorrowBalances,
	useSupplyBalances,
} from '../../../hooks/hard-synths/useBalances'
import {
	AccountLiquidity,
	useAccountLiquidity,
} from '../../../hooks/hard-synths/useAccountLiquidity'
import useTransactionProvider from '../../../hooks/useTransactionProvider'
import useBao from '../../../hooks/useBao'
import { useWallet } from 'use-wallet'
import { useExchangeRates } from '../../../hooks/hard-synths/useExchangeRates'
import { useAccountMarkets } from '../../../hooks/hard-synths/useMarkets'
import { Accordion, Col, Container, FormCheck, Row } from 'react-bootstrap'
import { SpinnerLoader } from '../../../components/Loader'
import { MarketBorrowModal, MarketSupplyModal } from './Modals'
import { MarketDetails, StatBlock } from './Stats'
import Tooltipped from '../../../components/Tooltipped'
import { SubmitButton } from './MarketButton'
import { decimate, getDisplayBalance } from '../../../utils/numberFormat'
import { getComptrollerContract } from '../../../bao/utils'
import { SupportedMarket } from '../../../bao/lib/types'
import { TransactionReceipt } from 'web3-core'

export const MarketList: React.FC<MarketListProps> = ({
	markets: _markets,
}: MarketListProps) => {
	const accountBalances = useAccountBalances()
	const accountMarkets = useAccountMarkets()
	const accountLiquidity = useAccountLiquidity()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const { prices } = useMarketPrices()

	const activeMarkets = useMemo(() => {
		if (!(supplyBalances && borrowBalances)) return undefined

		// Find markets with outstanding supply / borrows
		return _markets.filter(
			(market) =>
				supplyBalances.find((balance) => balance.address === market.token)
					.balance > 0 ||
				borrowBalances.find((balance) => balance.address === market.token)
					.balance > 0,
		)
	}, [_markets, supplyBalances, borrowBalances])

	const markets = useMemo(() => {
		if (!activeMarkets) return undefined

		// Place markets with outstanding borrows / supplies first in the list
		return _markets.filter((market) => !activeMarkets.includes(market))
	}, [_markets, activeMarkets])

	return (
		<>
			{activeMarkets &&
			markets &&
			accountBalances &&
			accountLiquidity &&
			accountMarkets &&
			supplyBalances &&
			borrowBalances &&
			exchangeRates &&
			prices ? (
				<>
					<MarketListHeader />
					{activeMarkets.length > 0 && (
						<>
							{activeMarkets.map((market: SupportedMarket) => (
								<MarketListItem
									market={market}
									accountBalances={accountBalances}
									accountMarkets={accountMarkets}
									accountLiquidity={accountLiquidity}
									supplyBalances={supplyBalances}
									borrowBalances={borrowBalances}
									exchangeRates={exchangeRates}
									prices={prices}
									key={market.token}
								/>
							))}
							<hr style={{ margin: '12px' }} />
						</>
					)}
					{markets.map((market: SupportedMarket) => (
						<MarketListItem
							market={market}
							accountBalances={accountBalances}
							accountMarkets={accountMarkets}
							accountLiquidity={accountLiquidity}
							supplyBalances={supplyBalances}
							borrowBalances={borrowBalances}
							exchangeRates={exchangeRates}
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
		'Supplied',
		'Borrowed',
		'Supply APY',
		'Borrow APR',
		'Total Supplied',
		'Total Borrowed',
	]

	return (
		<Container fluid>
			<Row lg={7} style={{ padding: '0.5rem 1.5rem' }}>
				{headers.map((header: string) => (
					<MarketListHeaderCol
						style={{ padding: '12px', paddingBottom: '0px' }}
						key={header}
					>
						<b>{header}</b>
					</MarketListHeaderCol>
				))}
			</Row>
		</Container>
	)
}

const MarketListItem: React.FC<MarketListItemProps> = ({
	market,
	accountBalances,
	accountMarkets,
	accountLiquidity,
	supplyBalances,
	borrowBalances,
	exchangeRates,
	prices,
}: MarketListItemProps) => {
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const { onAddTransaction, onTxReceipt } = useTransactionProvider()
	const bao = useBao()
	const { account }: { account: string } = useWallet()

	const suppliedUnderlying = useMemo(
		() =>
			supplyBalances.find((balance) => balance.address === market.token)
				.balance * decimate(exchangeRates[market.token]).toNumber(),
		[supplyBalances, exchangeRates],
	)

	const borrowed = useMemo(
		() =>
			borrowBalances.find((balance) => balance.address === market.token)
				.balance,
		[borrowBalances, exchangeRates],
	)

	const isInMarket = useMemo(
		() =>
			accountMarkets &&
			accountMarkets.find((_market) => _market.token === market.token),
		[accountMarkets],
	)

	return (
		<Accordion>
			<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
				<StyledAccordionHeader>
					<Row lg={7} style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>
							{`$${getDisplayBalance(
								suppliedUnderlying *
									decimate(
										prices[market.token],
										36 - market.decimals,
									).toNumber(),
								0,
							)}`}{' '}
							<StyledCheck checked={isInMarket} inline />
						</Col>
						<Col>
							{`$${getDisplayBalance(
								borrowed *
									decimate(
										prices[market.token],
										36 - market.decimals,
									).toNumber(),
								0,
							)}`}
						</Col>
						<Col>{market.supplyApy.toFixed(2)}%</Col>
						<Col>{market.borrowApy.toFixed(2)}%</Col>
						<Col>
							{`$${getDisplayBalance(
								market.supplied *
									decimate(
										prices[market.token],
										36 - market.decimals,
									).toNumber(),
								0,
							)}`}
						</Col>
						<Col>
							{`$${getDisplayBalance(
								market.totalBorrows *
									decimate(
										prices[market.token],
										36 - market.decimals,
									).toNumber(),
								0,
							)}`}
						</Col>
					</Row>
				</StyledAccordionHeader>
				<StyledAccordionBody>
					<Row lg={3}>
						<Col>
							<h4>
								Supply
								<span style={{ float: 'right', display: 'inline' }}>
									<Tooltipped
										content={`${
											isInMarket ? 'Exit' : 'Enter'
										} Market w/ Supplied Collateral`}
									>
										<FormCheck
											type="switch"
											id="custom-switch"
											checked={!!isInMarket}
											disabled={
												(isInMarket && borrowed > 0) ||
												supplyBalances.find(
													(balance) => balance.address === market.token,
												).balance === 0
											}
											onClick={(event) => {
												event.stopPropagation()
												const contract = getComptrollerContract(bao)
												if (isInMarket) {
													contract.methods
														.exitMarket(market.token)
														.send({ from: account })
														.on('transactionHash', (txHash: string) =>
															onAddTransaction({
																hash: txHash,
																description: `Exit Market (${market.underlyingSymbol})`,
															}),
														)
														.on('receipt', (receipt: TransactionReceipt) =>
															onTxReceipt(receipt),
														)
												} else {
													contract.methods
														.enterMarkets([market.token])
														.send({ from: account })
														.on('transactionHash', (txHash: string) =>
															onAddTransaction({
																hash: txHash,
																description: `Enter Market (${market.underlyingSymbol})`,
															}),
														)
														.on('receipt', (receipt: TransactionReceipt) =>
															onTxReceipt(receipt),
														)
												}
											}}
										/>
									</Tooltipped>
								</span>
							</h4>
							<hr />
							<StatBlock
								label={null}
								stats={[
									{
										label: 'Supplied',
										value: `${suppliedUnderlying.toFixed(4)} ${
											market.underlyingSymbol
										} | $${getDisplayBalance(
											suppliedUnderlying *
												decimate(
													prices[market.token],
													36 - market.decimals,
												).toNumber(),
											0,
										)}`,
									},
									{
										label: 'Wallet Balance',
										value: `${accountBalances
											.find((balance) => balance.address === market.underlying)
											.balance.toFixed(4)} ${market.underlyingSymbol}`,
									},
								]}
							/>
							<br />
							<SubmitButton onClick={() => setShowSupplyModal(true)}>
								Supply / Withdraw
							</SubmitButton>
							<MarketSupplyModal
								asset={market}
								show={showSupplyModal}
								onHide={() => setShowSupplyModal(false)}
							/>
						</Col>
						<Col>
							<h4>Market Details</h4>
							<hr />
							<MarketDetails asset={market} title={null} />
						</Col>
						<Col>
							<h4>Borrow</h4>
							<hr />
							<StatBlock
								label={null}
								stats={[
									{
										label: 'Borrowed',
										value: `${borrowed.toFixed(4)} ${
											market.underlyingSymbol
										} | $${getDisplayBalance(
											borrowed *
												decimate(
													prices[market.token],
													36 - market.decimals,
												).toNumber(),
											0,
										)}`,
									},
									{
										label: 'Borrow Limit Remaining',
										value: `$${getDisplayBalance(
											accountLiquidity.usdBorrowable,
											0,
										)}`,
									},
								]}
							/>
							<br />
							<SubmitButton onClick={() => setShowBorrowModal(true)}>
								Borrow / Repay
							</SubmitButton>
							<MarketBorrowModal
								asset={market}
								show={showBorrowModal}
								onHide={() => setShowBorrowModal(false)}
							/>
						</Col>
					</Row>
				</StyledAccordionBody>
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
	accountMarkets: SupportedMarket[]
	accountLiquidity: AccountLiquidity
	supplyBalances: Balance[]
	borrowBalances: Balance[]
	exchangeRates: { [key: string]: BigNumber }
	prices: { [key: string]: number }
}

const StyledAccordionHeader = styled(Accordion.Header)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: 8px;

	img {
		height: 32px;
		margin-right: 0.75rem;
		vertical-align: middle;
	}

	> button {
		background-color: ${(props) => props.theme.color.primary[100]};
		color: ${(props) => props.theme.color.text[100]};
		padding: 1.25rem;

		&:hover,
		&:focus,
		&:active,
		&:not(.collapsed) {
			background-color: ${(props) => props.theme.color.primary[200]};
			color: ${(props) => props.theme.color.text[100]};
			box-shadow: none;
			border-top-left-radius: 8px;
			border-top-right-radius: 8px;
			border-bottom-left-radius: 0px;
			border-bottom-right-radius: 0px;
		}

		&:not(.collapsed) {
			transition: none;

			&:focus,
			&:active {
				border-color: ${(props) => props.theme.color.primary[300]};
			}

			::after {
				background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
					props,
				) =>
					props.theme.color.text[100].replace(
						'#',
						'%23',
					)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
			}
		}

		::after {
			// don't turn arrow blue
			background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
				props,
			) =>
				props.theme.color.text[100].replace(
					'#',
					'%23',
				)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
		}

		.row > .col {
			margin: auto 0;
			text-align: right;

			&:first-child {
				text-align: left;
			}

			&:last-child {
				margin-right: 25px;
			}
		}
	}
`

const StyledCheck = styled(FormCheck)`
	margin: 0;

	> input {
		margin: 0;
		user-select: none;

		&:focus {
			outline: none;
			box-shadow: none;
		}
	}
`

const StyledAccordionItem = styled(Accordion.Item)`
	background-color: transparent;
	border-color: transparent;
`

const StyledAccordionBody = styled(Accordion.Body)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
	border-top: 2px solid ${(props) => props.theme.color.primary[300]};
`

const MarketListHeaderCol = styled(Col)`
	text-align: right;

	&:first-child {
		text-align: left;
	}

	&:last-child {
		margin-right: 45px;
	}
`
