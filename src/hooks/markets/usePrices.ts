import Config from '@/bao/lib/config'
import fetcher from '@/bao/lib/fetcher'
import { SWR } from '@/bao/lib/types'
import MultiCall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import useSWR from 'swr'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import useContract from '@/hooks/base/useContract'
import type { MarketOracle } from '@/typechain/index'
//import { parseUnits } from 'ethers/lib/utils'

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
	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const [prices, setPrices] = useState<{ [key: string]: BigNumber } | undefined>()
	const oracle = useContract<MarketOracle>('MarketOracle')

	const { chainId } = useWeb3React()

	const fetchPrices = useCallback(async () => {
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

		setPrices(
			data['MarketOracle'].reduce(
				(_prices: { [key: string]: { usd: number } }, result: any) => ({
					..._prices,
					[result.ref]: result.values[0],
				}),
				{},
			),
		)
	}, [bao, oracle, chainId])

	useEffect(() => {
		if (!bao || !oracle) return
		fetchPrices()
	}, [fetchPrices, transactions, bao, oracle])

	return {
		prices,
	}
}
