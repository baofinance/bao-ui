import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import Config from '../../../bao/lib/config'
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
import {
	Accordion,
	Badge,
	Col,
	Container,
	FormCheck,
	Row,
} from 'react-bootstrap'
import { SpinnerLoader } from '../../../components/Loader'
import { MarketBorrowModal, MarketSupplyModal } from './Modals'
import { MarketDetails, StatBlock } from './Stats'
import Tooltipped from '../../../components/Tooltipped'
import HrText from '../../../components/HrText'
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

	const collateralMarkets = useMemo(() => {
		if (!(_markets && supplyBalances)) return
		return _markets
			.filter((market) => !market.isSynth)
			.sort((a, b) =>
				supplyBalances.find(
					(balance) => balance.address.toLowerCase() === b.token.toLowerCase(),
				).balance > 0
					? 1
					: 0,
			)
	}, [_markets, supplyBalances])

	const synthMarkets = useMemo(() => {
		if (!(_markets && borrowBalances)) return
		return _markets
			.filter((market) => market.isSynth)
			.sort((a, b) =>
				borrowBalances.find(
					(balance) => balance.address.toLowerCase() === b.token.toLowerCase(),
				).balance > 0
					? 1
					: 0,
			)
	}, [_markets, borrowBalances])

	return (
		<>
			{collateralMarkets &&
			synthMarkets &&
			accountBalances &&
			accountLiquidity &&
			accountMarkets &&
			supplyBalances &&
			borrowBalances &&
			exchangeRates &&
			prices ? (
				<Row>
					<Col>
						<HrText content="Collateral" />
						<MarketListHeader
							headers={['Asset', 'APY', 'Wallet', 'Liquidity']}
						/>
						{collateralMarkets.map((market: SupportedMarket) => (
							<MarketListItemCollateral
								market={market}
								accountBalances={accountBalances}
								accountMarkets={accountMarkets}
								supplyBalances={supplyBalances}
								borrowBalances={borrowBalances}
								exchangeRates={exchangeRates}
								prices={prices}
								key={market.token}
							/>
						))}
					</Col>
					<Col>
						<HrText content="Synthetics" />
						<MarketListHeader headers={['Asset', 'APR', 'Wallet']} />
						{synthMarkets.map((market: SupportedMarket) => (
							<MarketListItemSynth
								market={market}
								accountLiquidity={accountLiquidity}
								accountBalances={accountBalances}
								borrowBalances={borrowBalances}
								exchangeRates={exchangeRates}
								prices={prices}
								key={market.token}
							/>
						))}
					</Col>
				</Row>
			) : (
				<SpinnerLoader block />
			)}
		</>
	)
}

const MarketListHeader: React.FC<MarketListHeaderProps> = ({
	headers,
}: MarketListHeaderProps) => {
	return (
		<Container fluid>
			<Row style={{ padding: '0.5rem 12px' }}>
				{headers.map((header: string) => (
					<MarketListHeaderCol style={{ paddingBottom: '0px' }} key={header}>
						<b>{header}</b>
					</MarketListHeaderCol>
				))}
			</Row>
		</Container>
	)
}

const MarketListItemCollateral: React.FC<MarketListItemProps> = ({
	market,
	accountBalances,
	accountMarkets,
	supplyBalances,
	borrowBalances,
	exchangeRates,
	prices,
}: MarketListItemProps) => {
	const [showSupplyModal, setShowSupplyModal] = useState(false)
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
					<Row style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>{market.supplyApy.toFixed(2)}%</Col>
						<Col>
							{accountBalances
								.find((balance) => balance.address === market.underlying)
								.balance.toFixed(4)}
						</Col>
						<Col>
							{`$${getDisplayBalance(
								market.supplied *
									decimate(
										prices[market.token],
										36 - market.decimals,
									).toNumber() -
									market.totalBorrows *
										decimate(
											prices[market.token],
											36 - market.decimals,
										).toNumber(),
								0,
								0,
							)}`}
						</Col>
					</Row>
				</StyledAccordionHeader>
				<StyledAccordionBody>
					<StatBlock
						label="Supply Details"
						stats={[
							{
								label: 'Total Supplied',
								value: `${market.supplied.toFixed(4)} ${
									market.underlyingSymbol
								} | $${getDisplayBalance(
									market.supplied *
										decimate(
											prices[market.token],
											36 - market.decimals,
										).toNumber(),
									0,
								)}`,
							},
							{
								label: 'Your Supply',
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
								label: 'Collateral',
								value: (
									<Tooltipped
										content={
											<>
												{isInMarket ? 'Exit' : 'Enter'} Market w/ Supplied
												Collateral.
												<br />
												<br />
												<Badge bg="warning">WARNING</Badge>
												<br />
												Any supplied assets that are flagged as collateral can
												be seized if you are liquidated.
											</>
										}
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
														.enterMarkets([market.token], Config.addressMap.DEAD) // Use dead as a placeholder param for `address borrower`, it will be unused
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
								),
							},
							{
								label: 'Wallet Balance',
								value: `${accountBalances
									.find((balance) => balance.address === market.underlying)
									.balance.toFixed(4)} ${market.underlyingSymbol}`,
							},
						]}
					/>
					<MarketDetails asset={market} title="Market Details" />
					<br />
					<Row>
						<Col>
							<SubmitButton onClick={() => setShowSupplyModal(true)}>
								Supply / Withdraw
							</SubmitButton>
						</Col>
						<Col>
							<SubmitButton
								onClick={() => (window.location.href = `/market/${market.mid}`)}
							>
								Details
							</SubmitButton>
						</Col>
					</Row>
					<MarketSupplyModal
						asset={market}
						show={showSupplyModal}
						onHide={() => setShowSupplyModal(false)}
					/>
				</StyledAccordionBody>
			</StyledAccordionItem>
		</Accordion>
	)
}

const MarketListItemSynth: React.FC<MarketListItemProps> = ({
	market,
	accountLiquidity,
	accountBalances,
	borrowBalances,
	exchangeRates,
	prices,
}: MarketListItemProps) => {
	const [showBorrowModal, setShowBorrowModal] = useState(false)

	const borrowed = useMemo(
		() =>
			borrowBalances.find((balance) => balance.address === market.token)
				.balance,
		[borrowBalances, exchangeRates],
	)

	return (
		<Accordion>
			<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
				<StyledAccordionHeader>
					<Row style={{ width: '100%' }}>
						<Col>
							<img src={market.icon} /> <b>{market.underlyingSymbol}</b>
						</Col>
						<Col>{market.borrowApy.toFixed(2)}%</Col>
						<Col>
							{accountBalances
								.find((balance) => balance.address === market.underlying)
								.balance.toFixed(4)}
						</Col>
					</Row>
				</StyledAccordionHeader>
				<StyledAccordionBody>
					<StatBlock
						label="Debt Information"
						stats={[
							{
								label: 'Total Debt',
								value: `$${getDisplayBalance(
									market.totalBorrows *
										decimate(
											prices[market.token],
											36 - market.decimals,
										).toNumber(),
									0,
								)}`,
							},
							{
								label: 'Your Debt',
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
								label: 'Debt Limit Remaining',
								value: `$${getDisplayBalance(
									accountLiquidity.usdBorrowable,
									0,
								)}`,
							},
							{
								label: '% of Your Debt',
								value: `${Math.floor(
									((borrowed *
										decimate(
											prices[market.token],
											36 - market.decimals,
										).toNumber()) /
										accountLiquidity.usdBorrow) *
										100,
								)}%`,
							},
						]}
					/>
					<MarketDetails asset={market} title="Market Details" />
					<br />
					<Row>
						<Col>
							<SubmitButton onClick={() => setShowBorrowModal(true)}>
								Mint / Repay
							</SubmitButton>
						</Col>
						<Col>
							<SubmitButton
								onClick={() => (window.location.href = `/market/${market.mid}`)}
							>
								Details
							</SubmitButton>
						</Col>
					</Row>
					<MarketBorrowModal
						asset={market}
						show={showBorrowModal}
						onHide={() => setShowBorrowModal(false)}
					/>
				</StyledAccordionBody>
			</StyledAccordionItem>
		</Accordion>
	)
}

type MarketListProps = {
	markets: SupportedMarket[]
}

type MarketListHeaderProps = {
	headers: string[]
}

type MarketListItemProps = {
	market: SupportedMarket
	accountBalances?: Balance[]
	accountMarkets?: SupportedMarket[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
	prices?: { [key: string]: number }
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
			border-radius: 8px 8px 0 0;
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
		margin-right: 46px;
	}
`
