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
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { parseUnits } from 'ethers/lib/utils'
import { exponentiate } from '@/utils/numberFormat'

type Prices = {
	prices: {
		[key: string]: {
			usd: number
		}
	}
}

type MarketPrices = {
	prices: {
		[key: string]: BigNumber
	}
}

export const usePrice = (coingeckoId: string) => {
	const { library, account, chainId } = useWeb3React()
	const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`
	const enabled = !!library

	const { data: price, refetch } = useQuery(
		['@/hooks/markets/usePrice', providerKey(library, account, chainId), { enabled }],
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
			enabled,
			staleTime: 1000 * 60 * 3, // three minutes
			cacheTime: 1000 * 60 * 10, // ten minutes
			refetchOnReconnect: true,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return price
}

export const usePrices = () => {
	const { library, account, chainId } = useWeb3React()
	const coingeckoIds: any = Object.values(Config.markets).map(({ coingeckoId }) => coingeckoId)
	const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoIds.join(',')}`

	const enabled = !!library
	const { data: prices, refetch } = useQuery(
		['@/hooks/markets/usePrices', providerKey(library, account, chainId), { enabled }],
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
			enabled,
			staleTime: 1000 * 60 * 3, // three minutes
			cacheTime: 1000 * 60 * 10, // ten minutes
			refetchOnReconnect: true,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return prices
}

export const useMarketPrices = (): MarketPrices => {
	const bao = useBao()
	const oracle = useContract<MarketOracle>('MarketOracle')
	const { library, account, chainId } = useWeb3React()

	const enabled = !!bao && !!oracle && !!chainId
	const { data: prices, refetch } = useQuery(
		['@/hooks/markets/useMarketPrices', providerKey(library, account, chainId), { enabled }],
		async () => {
			const tokens = Config.markets.map(market => market.marketAddresses[chainId])
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
