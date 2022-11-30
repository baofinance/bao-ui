import Config from '@/bao/lib/config'
import fetcher from '@/bao/lib/fetcher'
import { SWR } from '@/bao/lib/types'
import MultiCall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useSWR from 'swr'
import useBao from '../base/useBao'
import useContract from '@/hooks/base/useContract'
import type { MarketOracle } from '@/typechain/index'
//import { parseUnits } from 'ethers/lib/utils'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

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

export const usePrice = (coingeckoId: string): SWR & Prices => {
	const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`
	const { data, error } = useSWR(url, fetcher)

	return {
		prices: data || {},
		isLoading: !error && !data,
		isError: error,
	}
}

export const usePrices = (): SWR & Prices => {
	const coingeckoIds = Object.values(Config.markets).map(({ coingeckoId }) => coingeckoId)
	const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoIds.join(',')}`
	const { data, error } = useSWR(url, fetcher)

	return {
		prices: data || {},
		isLoading: !error && !data,
		isError: error,
	}
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
					[result.ref]: result.values[0],
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
