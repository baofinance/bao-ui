import Config from '@/bao/lib/config'
import useContract from '@/hooks/base/useContract'
import type { MarketOracle } from '@/typechain/index'
import MultiCall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
//import { parseUnits } from 'ethers/lib/utils'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { exponentiate } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { parseUnits } from 'ethers/lib/utils'

type MarketPrices = {
	prices: {
		[key: string]: BigNumber
	}
}

export const usePrice = (coingeckoId: string) => {
	const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`

	const { data: price } = useQuery(
		['@/hooks/markets/usePrice'],
		async () => {
			const res = await (await fetch(url)).json()

			return Object.keys(res).reduce(
				(prev, cur) => ({
					...prev,
					price: parseUnits(res[cur].usd.toString()),
				}),
				{},
			)
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			staleTime: 1000 * 60 * 5,
			cacheTime: 1000 * 60 * 10,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			keepPreviousData: true,
			placeholderData: BigNumber.from(0),
		},
	)

	return price
}

export const usePrices = (marketName: string) => {
	const coingeckoIds: any = Object.values(Config.markets[marketName].markets).map(({ coingeckoId }) => coingeckoId)
	const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoIds.join(',')}`

	const { data: prices } = useQuery(
		['@/hooks/markets/usePrices'],
		async () => {
			const res = await (await fetch(url)).json()

			return Object.keys(res).reduce(
				(prev, cur) => ({
					...prev,
					[coingeckoIds[cur].toLowerCase()]: parseUnits(res[cur].usd.toString()),
				}),
				{},
			)
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			staleTime: 1000 * 60 * 5,
			cacheTime: 1000 * 60 * 10,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			keepPreviousData: true,
			placeholderData: BigNumber.from(0),
		},
	)

	return prices
}

export const useMarketPrices = (marketName: string): MarketPrices => {
	const bao = useBao()
	const { chainId } = useWeb3React()

	const oracle = useContract<MarketOracle>('MarketOracle', Config.markets[marketName].oracle)

	const enabled = !!bao && !!oracle && !!chainId
	const { data: prices, refetch } = useQuery(
		['@/hooks/markets/useMarketPrices', { enabled, marketName }],
		async () => {
			const tokens = Config.markets[marketName].markets.map(market => market.marketAddresses[chainId])
			const multiCallContext = MultiCall.createCallContext([
				{
					ref: 'MarketOracle',
					contract: oracle,
					calls: tokens.map(token => ({
						ref: token,
						method: 'getUnderlyingPrice',
						params: [token],
					})),
				},
			])
			const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))
			return data['MarketOracle'].reduce(
				(_prices: { [key: string]: { usd: number } }, result: any) => ({
					..._prices,
					[result.ref]: exponentiate(result.values[0]),
				}),
				{},
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return {
		prices,
	}
}
