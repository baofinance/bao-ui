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
import { Accordion, Col, FormCheck, Row } from 'react-bootstrap'
import { SpinnerLoader } from '../../../components/Loader'
import { MarketBorrowModal, MarketSupplyModal } from './Modals'
import { StatBlock } from './Stats'
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

	const markets = useMemo(() => {
		if (!(supplyBalances && borrowBalances)) return undefined

		// Place markets with outstanding borrows / supplies first in the list
		return _markets.sort((a) =>
			supplyBalances.find((balance) => balance.address === a.token).balance > 0 ||
			borrowBalances.find((balance) => balance.address === a.token).balance > 0
				? -1
				: 1,
		)
	}, [_markets, supplyBalances, borrowBalances])

	return (
		<>
			{markets &&
			accountBalances &&
			accountLiquidity &&
			accountMarkets &&
			supplyBalances &&
			borrowBalances &&
			exchangeRates &&
			prices ? (
				<>
					<MarketListHeader />
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
		'Supply APY',
		'Total Supplied',
		'Borrow APR',
		'Total Borrowed',
		'Supplied',
		'Borrowed',
	]

	return (
		<Row lg={7} style={{ padding: '0.5rem 2rem' }}>
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
			<StyledAccordionItem eventKey="0">
				<StyledAccordionHeader>
					<Row lg={7} style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>{market.supplyApy.toFixed(2)}%</Col>
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
						<Col>{market.borrowApy.toFixed(2)}%</Col>
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
						<Col>
							{`$${(
								suppliedUnderlying *
								decimate(prices[market.token], 36 - market.decimals).toNumber()
							).toFixed(2)}`}
						</Col>
						<Col>
							{`$${(
								borrowed *
								decimate(prices[market.token], 36 - market.decimals).toNumber()
							).toFixed(2)}`}
						</Col>
					</Row>
				</StyledAccordionHeader>
				<Accordion.Body>
					<Row lg={2}>
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
										} | $${(
											suppliedUnderlying *
											decimate(
												prices[market.token],
												36 - market.decimals,
											).toNumber()
										).toFixed(2)}`,
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
							<h4>Borrow</h4>
							<hr />
							<StatBlock
								label={null}
								stats={[
									{
										label: 'Borrowed',
										value: `${borrowed.toFixed(4)} ${
											market.underlyingSymbol
										} | $${(
											borrowed *
											decimate(
												prices[market.token],
												36 - market.decimals,
											).toNumber()
										).toFixed(2)}`,
									},
									{
										label: 'Borrow Limit Remaining',
										value: `$${accountLiquidity.usdBorrowable.toFixed(2)}`,
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
	accountMarkets: SupportedMarket[]
	accountLiquidity: AccountLiquidity
	supplyBalances: Balance[]
	borrowBalances: Balance[]
	exchangeRates: { [key: string]: BigNumber }
	prices: { [key: string]: number }
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
	background-color: ${(props) => props.theme.color.primary[100]};
	margin-bottom: 1em;
	border-color: transparent;
`
