import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'
import { decimate } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBorrowBalances, useSupplyBalances } from './useBalances'
import { useExchangeRates } from './useExchangeRates'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export type AccountLiquidity = {
	netApy: BigNumber
	usdSupply: BigNumber
	usdBorrow: BigNumber
	usdBorrowable: BigNumber
}

// FIXME: this should be refactored to use ethers.BigNumber.. not JavaScript floats
export const useAccountLiquidity = (): AccountLiquidity => {
	const { library, account, chainId } = useWeb3React()
	const markets = useMarkets()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()
	const { prices: oraclePrices } = useMarketPrices()
	const comptroller = useContract<Comptroller>('Comptroller')

	const enabled = !!comptroller && !!account && !!markets && !!supplyBalances && !!borrowBalances && !!exchangeRates && !!oraclePrices
	const { data: accountLiquidity, refetch } = useQuery(
		[
			'@/hooks/markets/useAccountLiquidity',
			providerKey(library, account, chainId),
			{
				enabled,
				supplyBalances,
				borrowBalances,
				exchangeRates,
				oraclePrices,
			},
		],
		async () => {
			const compAccountLiqudity = await comptroller.getAccountLiquidity(account)

			const prices: { [key: string]: BigNumber } = {}
			for (const key in oraclePrices) {
				const decimals = 36 - Config.markets.find(market => market.marketAddresses[chainId] === key).underlyingDecimals
				prices[key] = decimate(oraclePrices[key], decimals)
			}

			const usdSupply = Object.keys(exchangeRates).reduce((prev: BigNumber, addr: string) => {
				const supply = supplyBalances.find(balance => balance.address === addr)
				return prev.add(decimate(supply.balance.mul(exchangeRates[addr]).mul(prices[addr])))
			}, BigNumber.from(0))

			const usdBorrow = Object.entries(borrowBalances).reduce((prev: BigNumber, [, { address, balance }]) => {
				return prev.add(balance.mul(prices[address]))
			}, BigNumber.from(0))

			const supplyApy = markets.reduce((prev, { marketAddress, supplyApy }: ActiveSupportedMarket) => {
				const supplyBal = supplyBalances
					.find(balance => balance.address === marketAddress)
					.balance.mul(exchangeRates[marketAddress])
					.mul(prices[marketAddress])
					.mul(supplyApy)
				return prev.add(supplyBal)
			}, BigNumber.from(0))

			const borrowApy = markets.reduce((prev: BigNumber, { marketAddress, supplyApy }: ActiveSupportedMarket) => {
				const apy = borrowBalances.find(balance => balance.address === marketAddress).balance
				return prev.add(apy.mul(prices[marketAddress]).mul(supplyApy))
			}, BigNumber.from(0))

			const netApy =
				supplyApy.gt(borrowApy) && !usdSupply.eq(0)
					? supplyApy.sub(borrowApy).div(usdSupply)
					: borrowApy.gt(supplyApy) && !usdBorrow.eq(0)
					? supplyApy.sub(borrowApy).div(usdBorrow)
					: BigNumber.from(0)

			return {
				netApy,
				usdSupply,
				usdBorrow,
				usdBorrowable: compAccountLiqudity[1],
			}
		},
		{
			enabled,
			placeholderData: {
				netApy: BigNumber.from(0),
				usdSupply: BigNumber.from(0),
				usdBorrow: BigNumber.from(0),
				usdBorrowable: BigNumber.from(0),
			},
		},
	)

	const _refetch = async () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return accountLiquidity
}
