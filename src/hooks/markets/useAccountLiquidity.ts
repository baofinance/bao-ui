import Config from 'bao/lib/config'
import { ActiveSupportedMarket } from 'bao/lib/types'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { decimate } from 'utils/numberFormat'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import { useBorrowBalances, useSupplyBalances } from './useBalances'
import { useExchangeRates } from './useExchangeRates'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { useWeb3React } from '@web3-react/core'

export type AccountLiquidity = {
	netApy: number
	usdSupply: number
	usdBorrow: number
	usdBorrowable: number
}

export const useAccountLiquidity = (): AccountLiquidity => {
	const [accountLiquidity, setAccountLiquidity] = useState<undefined | AccountLiquidity>()

	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const { account } = useWeb3React()
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const { prices: oraclePrices } = useMarketPrices()

	const fetchAccountLiquidity = useCallback(async () => {
		const compAccountLiqudity = await bao.getContract('comptroller').methods.getAccountLiquidity(account).call()

		const prices: { [key: string]: number } = {}
		for (const key in oraclePrices) {
			if (oraclePrices[key]) {
				prices[key] = decimate(
					oraclePrices[key],
					new BigNumber(36).minus(Config.markets.find(market => market.marketAddresses[Config.networkId] === key).underlyingDecimals),
				).toNumber()
			}
		}

		const usdSupply = Object.entries(supplyBalances).reduce((prev: number, [, { address, balance }]) => {
			return prev + balance * decimate(exchangeRates[address]).toNumber() * prices[address]
		}, 0)

		const usdBorrow = Object.entries(borrowBalances).reduce((prev: number, [, { address, balance }]) => prev + balance * prices[address], 0)

		const supplyApy = markets.reduce(
			(prev, { marketAddress, supplyApy }: ActiveSupportedMarket) =>
				prev +
				supplyBalances.find(balance => balance.address === marketAddress).balance *
					decimate(exchangeRates[marketAddress]).toNumber() *
					prices[marketAddress] *
					supplyApy,
			0,
		)

		const borrowApy = markets.reduce(
			(prev: number, { marketAddress, supplyApy }: ActiveSupportedMarket) =>
				prev + borrowBalances.find(balance => balance.address === marketAddress).balance * prices[marketAddress] * supplyApy,
			0,
		)

		const netApy =
			supplyApy > borrowApy ? (supplyApy - borrowApy) / usdSupply : borrowApy > supplyApy ? (supplyApy - borrowApy) / usdBorrow : 0

		setAccountLiquidity({
			netApy,
			usdSupply,
			usdBorrow,
			usdBorrowable: decimate(compAccountLiqudity[1]).toNumber(),
		})
	}, [transactions, bao, account, markets, supplyBalances, borrowBalances, exchangeRates, oraclePrices])

	useEffect(() => {
		if (!(bao && account && markets && supplyBalances && borrowBalances && exchangeRates && oraclePrices)) return
		fetchAccountLiquidity()
	}, [transactions, bao, account, markets, supplyBalances, borrowBalances, exchangeRates, oraclePrices])

	return accountLiquidity
}
