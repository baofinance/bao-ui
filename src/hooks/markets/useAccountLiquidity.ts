import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import { decimate } from '@/utils/numberFormat'

import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import { useBorrowBalances, useSupplyBalances } from './useBalances'
import { useExchangeRates } from './useExchangeRates'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { formatEther } from 'ethers/lib/utils'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'

export type AccountLiquidity = {
	netApy: number
	usdSupply: number
	usdBorrow: number
	usdBorrowable: number
}

// FIXME: this should be refactored to use ethers.BigNumber.. not JavaScript floats
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
	const comptroller = useContract<Comptroller>('Comptroller')

	const fetchAccountLiquidity = useCallback(async () => {
		const compAccountLiqudity = await comptroller.getAccountLiquidity(account)

		const prices: { [key: string]: number } = {}
		for (const key in oraclePrices) {
			prices[key] = decimate(
				oraclePrices[key],
				36 - Config.markets.find(market => market.marketAddresses[Config.networkId] === key).underlyingDecimals,
			).toNumber()
		}

		const usdSupply = Object.keys(exchangeRates).reduce((prev: number, addr: string) => {
			const supply = supplyBalances.find(b => b.address === addr)
			return prev + supply.balance * parseFloat(formatEther(exchangeRates[addr])) * prices[addr]
		}, 0)

		const usdBorrow = Object.entries(borrowBalances).reduce((prev: number, [, { address, balance }]) => prev + balance * prices[address], 0)

		const supplyApy = markets.reduce(
			(prev, { marketAddress, supplyApy }: ActiveSupportedMarket) =>
				prev +
				supplyBalances.find(balance => balance.address === marketAddress).balance *
					parseFloat(formatEther(exchangeRates[marketAddress])) *
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
			usdBorrowable: parseFloat(formatEther(compAccountLiqudity[1])),
		})
	}, [comptroller, account, markets, supplyBalances, borrowBalances, exchangeRates, oraclePrices])

	useEffect(() => {
		if (!(markets && supplyBalances && borrowBalances && exchangeRates && oraclePrices && comptroller)) return
		fetchAccountLiquidity()
	}, [transactions, bao, account, markets, supplyBalances, borrowBalances, exchangeRates, oraclePrices, fetchAccountLiquidity, comptroller])

	return accountLiquidity
}
