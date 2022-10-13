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
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'

export type AccountLiquidity = {
	netApy: BigNumber
	usdSupply: BigNumber
	usdBorrow: BigNumber
	usdBorrowable: BigNumber
}

// FIXME: this should be refactored to use ethers.BigNumber.. not JavaScript floats
export const useAccountLiquidity = (): AccountLiquidity => {
	const [accountLiquidity, setAccountLiquidity] = useState<undefined | AccountLiquidity>()

	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const { account, chainId } = useWeb3React()
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const { prices: oraclePrices } = useMarketPrices()
	const comptroller = useContract<Comptroller>('Comptroller')

	const fetchAccountLiquidity = useCallback(async () => {
		const compAccountLiqudity = await comptroller.getAccountLiquidity(account)

		const prices: { [key: string]: BigNumber } = {}
		for (const key in oraclePrices) {
			const decimals = 36 - Config.markets.find(market => market.marketAddresses[chainId] === key).underlyingDecimals
			prices[key] = decimate(oraclePrices[key], decimals)
		}

		const usdSupply = Object.keys(exchangeRates).reduce((prev: BigNumber, addr: string) => {
			const supply = supplyBalances.find(b => b.address === addr)
			return prev.add(decimate(supply.balance.mul(exchangeRates[addr]).mul(prices[addr])))
		}, BigNumber.from(0))

		const usdBorrow = Object.entries(borrowBalances).reduce((prev: BigNumber, [, { address, balance }]) => {
			return prev.add(balance.mul(prices[address]))
		}, BigNumber.from(0))

		const supplyApy = markets.reduce((prev, { marketAddress, supplyApy }: ActiveSupportedMarket) => {
			const supplyBal = supplyBalances
				.find(balance => balance.address === marketAddress).balance
				.mul(exchangeRates[marketAddress])
				.mul(prices[marketAddress])
				.mul(supplyApy)
			return prev.add(supplyBal)
		}, BigNumber.from(0))

		const borrowApy = markets.reduce((prev: BigNumber, { marketAddress, supplyApy }: ActiveSupportedMarket) => {
			const apy = borrowBalances.find(balance => balance.address === marketAddress).balance
			return prev.add(apy.mul(prices[marketAddress]).mul(supplyApy))
		}, BigNumber.from(0))

		const netApy = (supplyApy.gt(borrowApy) && !usdSupply.eq(0))
			? supplyApy.sub(borrowApy).div(usdSupply)
			: (borrowApy.gt(supplyApy) && !usdBorrow.eq(0))
			? supplyApy.sub(borrowApy).div(usdBorrow)
			: BigNumber.from(0)

		setAccountLiquidity({
			netApy,
			usdSupply,
			usdBorrow,
			usdBorrowable: compAccountLiqudity[1],
		})
	}, [comptroller, account, markets, supplyBalances, borrowBalances, exchangeRates, oraclePrices, chainId])

	useEffect(() => {
		if (!(markets && supplyBalances && borrowBalances && exchangeRates && oraclePrices && comptroller)) return
		fetchAccountLiquidity()
	}, [transactions, bao, account, markets, supplyBalances, borrowBalances, exchangeRates, oraclePrices, fetchAccountLiquidity, comptroller])

	return accountLiquidity
}
