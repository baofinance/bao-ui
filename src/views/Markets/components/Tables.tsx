import { getComptrollerContract } from 'bao/utils'
import Table from 'components/Table'
import { commify } from 'ethers/lib/utils'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import {
	useAccountBalances,
	useBorrowBalances,
	useSupplyBalances
} from 'hooks/hard-synths/useBalances'
import { useExchangeRates } from 'hooks/hard-synths/useExchangeRates'
import { useAccountMarkets, useMarkets } from 'hooks/hard-synths/useMarkets'
import { usePrices } from 'hooks/hard-synths/usePrices'
import useBao from 'hooks/useBao'
import React, { useState } from 'react'
import { FormCheck } from 'react-bootstrap'
import { SupportedMarket } from '../../../bao/lib/types'
import { decimate } from '../../../utils/numberFormat'
import { MarketBorrowModal, MarketSupplyModal } from './Modals'
import {
	Flex,
	HeaderWrapper,
	ItemWrapper,
	MarketContainer,
	MarketHeader,
	MarketHeaderContainer,
	MarketHeaderStack,
	MarketHeaderSubText,
	MarketHeaderText, OverviewTableContainer, TableContainer
} from './styles'

export const Supply: React.FC = () => {
	const [modalAsset, setModalAsset] = useState<SupportedMarket>()
	const [modalShow, setModalShow] = useState(false)

	const balances = useAccountBalances()
	const markets = useMarkets()

	const handleSupply = (asset: SupportedMarket) => {
		setModalAsset(asset)
		setModalShow(true)
	}

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value(market: SupportedMarket) {
				// underlying symbol
				const balanceRes = balances && balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)
				const symbol = balanceRes && balanceRes.symbol

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper
					style={{ justifyContent: 'center', textAlign: 'center' }}
				>
					APY
				</HeaderWrapper>
			),
			value({ supplyApy }: SupportedMarket) {
				return (
					<ItemWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						{supplyApy ? `${supplyApy.toFixed(2)}%` : '-'}
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					Wallet
				</HeaderWrapper>
			),
			value(market: SupportedMarket) {
				// underlying balance & symbol
				const balanceRes = balances && balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)
				const balance = balanceRes ? balanceRes.balance : 0
				const symbol = balanceRes && balanceRes.symbol

				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
						{`${balance.toFixed(2)} ${symbol}`}
					</ItemWrapper>
				)
			},
		},
	]

	return (
		<>
			<Flex>
				<MarketContainer>
					<MarketHeaderContainer>
						<MarketHeaderStack>
							<MarketHeader>
								<Flex>
									<MarketHeaderText>Supply</MarketHeaderText>
								</Flex>
								<Flex>
									<MarketHeaderSubText>
										Earn interest on your deposits
									</MarketHeaderSubText>
								</Flex>
							</MarketHeader>
						</MarketHeaderStack>
					</MarketHeaderContainer>
					<TableContainer>
						<Table columns={columns} items={markets} onClick={handleSupply} />
						{modalAsset && (
							<MarketSupplyModal
								asset={modalAsset}
								show={modalShow}
								onHide={() => setModalShow(false)}
							/>
						)}
					</TableContainer>
				</MarketContainer>
			</Flex>
		</>
	)
}

export const Borrow = () => {
	const [modalAsset, setModalAsset] = useState<SupportedMarket>()
	const [modalShow, setModalShow] = useState(false)

	const balances = useAccountBalances()
	const markets = useMarkets()
	const { prices } = usePrices()

	const handleBorrow = (asset: SupportedMarket) => {
		setModalAsset(asset)
		setModalShow(true)
	}


	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value(market: SupportedMarket) {
				// underlying symbol
				const balanceRes = balances && balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)
				const symbol = balanceRes && balanceRes.symbol

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper
					style={{ justifyContent: 'center', textAlign: 'center' }}
				>
					APR
				</HeaderWrapper>
			),
			value({ borrowApy }: SupportedMarket) {
				return (
					<ItemWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						{borrowApy ? `${borrowApy.toFixed(2)}%` : '-'}
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					Liquidity
				</HeaderWrapper>
			),
			value(market: SupportedMarket) {
				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
						{market.liquidity && prices
							? `$${commify(
								(
									(market.liquidity *
										(prices[market.coingeckoId]?.usd || 1)) /
									1e6
								).toFixed(2),
							)}M`
							: '-'}
					</ItemWrapper>
				)
			},
		},
	]

	return (
		<>
			<Flex>
				<MarketContainer>
					<MarketHeaderContainer>
						<MarketHeaderStack>
							<MarketHeader>
								<MarketHeaderText>Borrow</MarketHeaderText>
								<MarketHeaderSubText>
									Borrow against your supplied collateral
								</MarketHeaderSubText>
							</MarketHeader>
						</MarketHeaderStack>
					</MarketHeaderContainer>
					<TableContainer>
						<Table columns={columns} items={markets} onClick={handleBorrow} />
						{modalAsset && (
							<MarketBorrowModal
								asset={modalAsset}
								show={modalShow}
								onHide={() => setModalShow(false)}
							/>
						)}
					</TableContainer>
				</MarketContainer>
			</Flex>
		</>
	)
}

export const Supplied: React.FC = () => {
	const bao = useBao()
	const markets = useMarkets()

	const balances = useSupplyBalances()
	const { exchangeRates } = useExchangeRates()
	const accountMarkets = useAccountMarkets()

	const [modalAsset, setModalAsset] = useState<SupportedMarket>()
	const [modalShow, setModalShow] = useState(false)

	const handleSupply = (asset: SupportedMarket) => {
		setModalAsset(asset)
		setModalShow(true)
	}

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value(market: SupportedMarket) {
				// underlying symbol

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{market.underlyingSymbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper
					style={{ justifyContent: 'center', textAlign: 'center' }}
				>
					APY
				</HeaderWrapper>
			),
			value({ supplyApy }: SupportedMarket) {
				return (
					<ItemWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						{supplyApy ? `${supplyApy.toFixed(2)}%` : '-'}
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					Balance
				</HeaderWrapper>
			),
			value({ token, underlyingSymbol }: SupportedMarket) {
				// underlying balance & symbol
				const balanceRes =
					balances &&
					balances.find(
						(balance) => balance.address.toLowerCase() === token.toLowerCase(),
					)
				const balance = balanceRes ? balanceRes.balance : 0
				const exchangeRate = decimate(exchangeRates[token])
				const suppliedBalance = balance * exchangeRate.toNumber()

				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
						{`${suppliedBalance.toFixed(2)} ${underlyingSymbol}`}
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					Collateral
				</HeaderWrapper>
			),
			value(market: SupportedMarket) {
				const isEnabled =
					accountMarkets && accountMarkets.find((market) => market.token)

				return (
					// underlying balance & symbol
					<ItemWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
						onClick={(event: React.MouseEvent<HTMLElement>) => {
							event.stopPropagation()
							const contract = getComptrollerContract(bao)
							if (isEnabled) {
								contract.methods.exitMarket(market.token)
							} else {
								contract.methods.enterMarket([market.token])
							}
						}}
					>
						<FormCheck type="switch" id="custom-switch" checked={!!isEnabled} />
					</ItemWrapper>
				)
			},
		},
	]

	return (
		<>
			<Flex>
				<MarketContainer>
					<TableContainer>
						<Table
							columns={columns}
							items={
								markets &&
								balances &&
								exchangeRates &&
								markets.filter(
									(market: SupportedMarket) =>
										balances.find((balance) => balance.address === market.token) &&
										balances.find((balance) => balance.address === market.token)
											.balance *
										exchangeRates[market.token].toNumber() >=
										0.01,
								)
							}
							onClick={handleSupply} />
						{modalAsset && (
							<MarketSupplyModal
								asset={modalAsset}
								show={modalShow}
								onHide={() => setModalShow(false)}
							/>
						)}
					</TableContainer>
				</MarketContainer>
			</Flex>
		</>
	)
}

export const Borrowed: React.FC = () => {
	const markets = useMarkets()
	const accountLiquidity = useAccountLiquidity()
	const balances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()

	const [modalAsset, setModalAsset] = useState<SupportedMarket>()
	const [modalShow, setModalShow] = useState(false)

	const handleBorrow = (asset: SupportedMarket) => {
		setModalAsset(asset)
		setModalShow(true)
	}

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value(market: SupportedMarket) {
				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{market.symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper
					style={{ justifyContent: 'center', textAlign: 'center' }}
				>
					APR
				</HeaderWrapper>
			),
			value({ borrowApy }: SupportedMarket) {
				return (
					<ItemWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						{borrowApy ? `${borrowApy.toFixed(2)}%` : '-'}
					</ItemWrapper>
				)
			},
		},
		{
			header: (
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					Balance
				</HeaderWrapper>
			),
			value(market: SupportedMarket) {
				// underlying balance
				const balanceRes =
					balances &&
					balances.find(
						(balance) =>
							balance.address.toLowerCase() === market.token.toLowerCase(),
					)
				const { balance } = balanceRes || { balance: 0 }

				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
						{`${balance.toFixed(2)} ${market.symbol}`}
					</ItemWrapper>
				)
			},
		},
	]

	return (
		<>
			<Flex>
				<MarketContainer>
					<TableContainer>
							{accountLiquidity ? (
								<Table
									columns={columns}
									items={markets.filter(
										(market: SupportedMarket) =>
											balances.find((balance) => balance.address === market.token) &&
											balances.find((balance) => balance.address === market.token)
												.balance *
											exchangeRates[market.token].toNumber() >=
											0.01,
									)}
									onClick={handleBorrow} />
							) : (
								<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}> You don't have any borrowed assets. </ItemWrapper>
							)}
							{modalAsset && (
								<MarketBorrowModal
									asset={modalAsset}
									show={modalShow}
									onHide={() => setModalShow(false)}
								/>
							)}
					</TableContainer>
				</MarketContainer>
			</Flex>
		</>
	)
}
