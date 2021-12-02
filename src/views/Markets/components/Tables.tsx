import { getComptrollerContract } from 'bao/utils'
import Table from 'components/Table'
import { commify } from 'ethers/lib/utils'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import {
	useAccountBalances,
	useBorrowBalances,
	useSupplyBalances,
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
	MarketHeaderSubText,
	MarketHeaderText,
	TableContainer,
} from './styles'
import { useWallet } from 'use-wallet'

export const Supply: React.FC = () => {
	const [modalAsset, setModalAsset] = useState<SupportedMarket>()
	const [modalShow, setModalShow] = useState(false)

	const balances = useAccountBalances()
	const markets = useMarkets()
	const accountMarkets = useAccountMarkets()

	const bao = useBao()
	const { account } = useWallet()

	const handleSupply = (asset: SupportedMarket) => {
		setModalAsset(asset)
		setModalShow(true)
	}

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value(market: SupportedMarket) {
				// underlying symbol
				const balanceRes =
					balances &&
					balances.find(
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
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					APY
				</HeaderWrapper>
			),
			value({ supplyApy }: SupportedMarket) {
				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
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
				const balanceRes =
					balances &&
					balances.find(
						(balance) =>
							balance.address.toLowerCase() === market.underlying.toLowerCase(),
					)
				const balance = balanceRes ? balanceRes.balance : 0
				const symbol = balanceRes && balanceRes.symbol

				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
						{`${commify(balance.toFixed(2))} ${symbol}`}
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
					accountMarkets &&
					accountMarkets.find((_market) => _market.token === market.token)

				return (
					<ItemWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
						onClick={(event: React.MouseEvent<HTMLElement>) => {
							event.stopPropagation()
							const contract = getComptrollerContract(bao)
							if (isEnabled) {
								contract.methods
									.exitMarket(market.token)
									.send({ from: account })
							} else {
								contract.methods
									.enterMarkets([market.token])
									.send({ from: account })
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
					<MarketHeader>
						<Flex>
							<MarketHeaderText>Supply Markets</MarketHeaderText>
						</Flex>
					</MarketHeader>
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
	const borrowBalances = useBorrowBalances()
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
				const balanceRes =
					balances &&
					balances.find(
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
				<HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					APR
				</HeaderWrapper>
			),
			value({ borrowApy }: SupportedMarket) {
				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
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
					borrowBalances &&
					borrowBalances.find(
						(balance) =>
							balance.address.toLowerCase() === market.token.toLowerCase(),
					)
				const { balance } = balanceRes || { balance: 0 }

				return (
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
						{`${commify(balance.toFixed(2))} ${market.underlyingSymbol}`}
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
					<MarketHeader>
						<Flex>
							<MarketHeaderText>Borrow Markets</MarketHeaderText>
						</Flex>
					</MarketHeader>
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