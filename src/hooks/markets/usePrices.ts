import Config from 'bao/lib/config'
import fetcher from 'bao/lib/fetcher'
import { SWR } from 'bao/lib/types'
import BigNumber from 'bignumber.js'
import useBlock from 'hooks/base/useBlock'
import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import MultiCall from 'utils/multicall'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'

type Prices = {
	prices: {
		[key: string]: {
			usd: number
		}
	}
}

type MarketPrices = {
	prices: {
		[key: string]: number
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
	const [prices, setPrices] = useState<undefined | { [key: string]: number }>()
	const block = useBlock()

	const fetchPrices = useCallback(async () => {
		const tokens = Config.markets.map(market => market.marketAddresses[Config.networkId])
		const multiCallContext = MultiCall.createCallContext([
			{
				ref: 'MarketOracle',
				contract: bao.getContract('marketOracle'),
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
					[result.ref]: new BigNumber(result.values[0].hex).toNumber(),
				}),
				{},
			),
		)
	}, [transactions, bao])

	useEffect(() => {
		if (!bao) return
		fetchPrices()
	}, [transactions, bao, block])

	return {
		prices,
	}
}
