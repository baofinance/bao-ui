import { getComptrollerContract } from 'bao/utils'
import Table from 'components/Table'
import Tooltipped from 'components/Tooltipped'
import { Market } from 'contexts/Markets'
import { commify } from 'ethers/lib/utils'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from 'hooks/hard-synths/useBalances'
import { useExchangeRates } from 'hooks/hard-synths/useExchangeRates'
import { useAccountMarkets, useMarkets } from 'hooks/hard-synths/useMarkets'
import { usePrices } from 'hooks/hard-synths/usePrices'
import useBao from 'hooks/useBao'
import useModal from 'hooks/useModal'
import React, { useState } from 'react'
import { FormCheck } from 'react-bootstrap'
import { useWallet } from 'use-wallet'
import { MarketBorrowModal, MarketSupplyModal } from './Modals'
import {
	BorrowLimit,
	BorrowMeter,
	BorrowMeterContainer,
	BorrowText, Flex, HeaderWrapper,
	ItemContainer,
	ItemWrapper, MarketContainer, MarketHeader, MarketHeaderContainer,
	MarketHeaderStack, MarketHeaderSubText, MarketHeaderText, MarketHeaderWrapper,
	MarketItemContainer,
	MarketItemWrapper,
	MarketSummary,
	MarketSummaryHeader, MarketTable, OverviewContainer,
	OverviewHeader, OverviewTableContainer, TableHeader
} from './styles'

export const Overview: React.FC = () => {
	return (
		<OverviewContainer>
			<OverviewHeader>
				<BorrowLimit>
					Borrow Limit <Tooltipped content={`Some info here.`} />
				</BorrowLimit>
				<BorrowText>0%</BorrowText>
				<BorrowMeterContainer>
					<BorrowMeter />
				</BorrowMeterContainer>
				<BorrowText>$0</BorrowText>
			</OverviewHeader>
		</OverviewContainer>
	)
}

export const Supply: React.FC = () => {
	// const [modalAsset, setModalAsset] = useState<Market>()
	// const { isOpen, onOpen, onClose } = useDisclosure()

	// const handleSupply = (asset: Market) => {
	// 	setModalAsset(asset)
	// 	onOpen()
	//   }

	const balances = useAccountBalances()
	const markets = useMarkets()

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value: (market: Market) => {
				// underlying symbol
				const { symbol } = balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>APY</HeaderWrapper>,
			value: ({ supplyApy }: Market) => (
				<ItemWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>
					{supplyApy ? `${supplyApy.toFixed(2)}%` : '-'}
				</ItemWrapper>
			),
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>Wallet</HeaderWrapper>,
			value: (market: Market) => {
				// underlying balance & symbol
				const { balance, symbol } = balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)

				return <ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>{`${balance.toFixed(2)} ${symbol}`}</ItemWrapper>
			}
		}
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
					<Table columns={columns} items={markets} />
				</MarketContainer>
			</Flex>
		</>
	)
}

type Prices = {
	prices: {
		[key: string]: {
			usd: number
		}
	}
}

export const Borrow = () => {
	const [handleBorrow] = useModal(<MarketBorrowModal />)
	const [modalAsset, setModalAsset] = useState<Market>()

	const balances = useAccountBalances()
	const markets = useMarkets()
	const { prices } = usePrices()

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value: (market: Market) => {
				// underlying symbol
				const { symbol } = balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>APR</HeaderWrapper>,
			value: ({ borrowApy }: Market) => (
				<ItemWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>
					{borrowApy ? `${borrowApy.toFixed(2)}%` : '-'}
				</ItemWrapper>
			),
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>Liquidity</HeaderWrapper>,
			value: (market: Market) => (
				// underlying balance & symbol
				<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>
					{market.liquidity && prices
						? `$${commify(((market.liquidity * (prices[market.coingeckoId]?.usd || 1)) / 1e6).toFixed(2))}M`
						: '-'}
				</ItemWrapper>
			),
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
									<MarketHeaderText>Borrow</MarketHeaderText>
								</Flex>
								<Flex>
									<MarketHeaderSubText>
										Borrow against your supplied collateral
									</MarketHeaderSubText>
								</Flex>
							</MarketHeader>
						</MarketHeaderStack>
					</MarketHeaderContainer>
					<Table columns={columns} items={markets} />
				</MarketContainer>
			</Flex>
		</>
	)
}

export const Supplied: React.FC = () => {
	const bao = useBao()
	const { ethereum } = useWallet()

	const markets = useMarkets()
	const usdSupply = useAccountLiquidity()
	const balances = useSupplyBalances()
	const exchangeRates = useExchangeRates()
	const accountMarkets = useAccountMarkets()
	const [modalAsset, setModalAsset] = useState<Market>()

	const [handleSupply] = useModal(<MarketSupplyModal />,)

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value: (market: Market) => {
				// underlying symbol
				const { symbol } = balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>APY</HeaderWrapper>,
			value: ({ supplyApy }: Market) => (
				<ItemWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>
					{supplyApy ? `${supplyApy.toFixed(2)}%` : '-'}
				</ItemWrapper>
			),
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>Balance</HeaderWrapper>,
			value: ({ token, underlying, symbol }: Market) => {
				// underlying balance & symbol
				const balance = balances.find(
					(balance) =>
						balance.address.toLowerCase() === underlying.toLowerCase(),
				)

				const exchangeRate = exchangeRates[token]

				const suppliedBalance = balance * exchangeRate

				return <ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>{`${suppliedBalance.toFixed(2)} ${symbol}`}</ItemWrapper>
			}
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>Collateral</HeaderWrapper>,
			value: (market: Market) => {
				const isEnabled = accountMarkets.find((market) => market.token)

				return (
					// underlying balance & symbol
					<ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}
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
			<OverviewTableContainer>
				<Table
					columns={columns}
					items={markets.filter(
						(market: Market) =>
							balances[market.token] &&
							(balances[market.token], market.decimals) *
							(exchangeRates[market.token]) >=
							0.01
					)}
				/>

				<MarketSummary>
					<MarketSummaryHeader>
						<MarketHeaderWrapper
							style={{
								justifyContent: 'flex-start',
								textAlign: 'start',
							}}
						>
							Total Collateral
						</MarketHeaderWrapper>
						<MarketHeaderWrapper
							style={{
								justifyContent: 'flex-end',
								textAlign: 'end',
							}}
						>
							Net APY
						</MarketHeaderWrapper>
					</MarketSummaryHeader>
					<MarketItemContainer>
						<ItemWrapper
							style={{ justifyContent: 'flex-start', textAlign: 'start' }}
						>
							{`$${usdSupply ? commify(usdSupply.toFixed(2)) : usdSupply.toFixed(2)}`}
						</ItemWrapper>
						<MarketItemWrapper
							style={{ justifyContent: 'flex-end', textAlign: 'end' }}
						>
							5.00%
						</MarketItemWrapper>
					</MarketItemContainer>
				</MarketSummary>
			</OverviewTableContainer>
		</>
	)
}

export const Borrowed: React.FC = () => {
	const bao = useBao()
	const { ethereum } = useWallet()

	const markets = useMarkets()
	const { usdBorrow, usdSupply } = useAccountLiquidity()
	const balances = useBorrowBalances()
	const exchangeRates = useExchangeRates()
	const accountMarkets = useAccountMarkets()
	const [modalAsset, setModalAsset] = useState<Market>()

	const [handleSupply] = useModal(<MarketSupplyModal />,)

	const columns = [
		{
			header: <HeaderWrapper>Asset</HeaderWrapper>,
			value: (market: Market) => {
				// underlying symbol
				const { symbol } = balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)

				return (
					<ItemWrapper>
						<img src={market.icon} />
						<p>{symbol}</p>
					</ItemWrapper>
				)
			},
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>APR</HeaderWrapper>,
			value: ({ borrowApy }: Market) => (
				<ItemWrapper style={{ justifyContent: 'center', textAlign: 'center' }}>
					{borrowApy ? `${borrowApy.toFixed(2)}%` : '-'}
				</ItemWrapper>
			),
		},
		{
			header: <HeaderWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>Balance</HeaderWrapper>,
			value: (market: Market) => {
				// underlying balance & symbol
				const { balance, symbol } = balances.find(
					(balance) =>
						balance.address.toLowerCase() === market.underlying.toLowerCase(),
				)

				return <ItemWrapper style={{ justifyContent: 'flex-end', textAlign: 'end' }}>{`${balance.toFixed(2)} ${symbol}`}</ItemWrapper>
			}
		}
	]

	return (
		<>
			<OverviewTableContainer>
				{usdBorrow ? (
					<Table
						columns={columns}
						items={markets.filter(
							(market: Market) =>
								balances[market.token] &&
								(balances[market.token], market.decimals) *
								(exchangeRates[market.token]) >=
								0.01
						)}
					/>
				) : (
					<ItemWrapper> You don't have any borrowed assets. </ItemWrapper>
				)}

				<MarketSummary>
					<MarketSummaryHeader>
						<MarketHeaderWrapper
							style={{
								justifyContent: 'flex-start',
								textAlign: 'start',
							}}
						>
							Total Debt
						</MarketHeaderWrapper>
						<MarketHeaderWrapper
							style={{
								justifyContent: 'flex-end',
								textAlign: 'end',
							}}
						>
							Net APR
						</MarketHeaderWrapper>
					</MarketSummaryHeader>
					<MarketItemContainer>
						<ItemWrapper
							style={{ justifyContent: 'flex-start', textAlign: 'start' }}
						>
							{`$${usdBorrow ? commify(usdBorrow.toFixed(2)) : usdBorrow.toFixed(2)}`}
						</ItemWrapper>
						<MarketItemWrapper
							style={{ justifyContent: 'flex-end', textAlign: 'end' }}
						>
							5.00%
						</MarketItemWrapper>
					</MarketItemContainer>
				</MarketSummary>
			</OverviewTableContainer>
		</>
	)
}