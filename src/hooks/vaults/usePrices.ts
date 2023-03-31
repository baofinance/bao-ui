import Config from '@/bao/lib/config'
import useContract from '@/hooks/base/useContract'
import type { VaultOracle } from '@/typechain/index'
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

type VaultPrices = {
	prices: {
		[key: string]: BigNumber
	}
}

export const usePrice = (coingeckoId: string) => {
	const url = `https://bao-price-api.herokuapp.com/api/price?id=${coingeckoId}`

	const { data: price } = useQuery(
		['@/hooks/vaults/usePrice'],
		async () => {
			const res = await (await fetch(url)).json()

			return Object.keys(res).reduce(
				(prev, cur) => ({
					...prev,
					price: parseUnits(res.price[cur].usd.toString()),
				}),
				{},
			)
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			staleTime: 1000 * 60 * 60,
			cacheTime: 1000 * 60 * 120,
			refetchOnReconnect: false,
			refetchInterval: 1000 * 60 * 5,
			keepPreviousData: true,
			placeholderData: BigNumber.from(0),
		},
	)

	return price
}

export const usePrices = (vaultName: string) => {
	const coingeckoIds: any = Object.values(Config.vaults[vaultName].markets).map(({ coingeckoId }) => coingeckoId)
	const url = `https://bao-price-api.herokuapp.com/api/price?id=${coingeckoIds.join(',')}`

	const { data: prices } = useQuery(
		['@/hooks/vaults/usePrices'],
		async () => {
			const res = await (await fetch(url)).json()

			return Object.keys(res).reduce(
				(prev, cur) => ({
					...prev,
					[coingeckoIds[cur].toLowerCase()]: parseUnits(res.price[cur].usd.toString()),
				}),
				{},
			)
		},
		{
			retry: true,
			retryDelay: 1000 * 60,
			staleTime: 1000 * 60 * 60,
			cacheTime: 1000 * 60 * 120,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			keepPreviousData: true,
			placeholderData: BigNumber.from(0),
		},
	)

	return prices
}

export const useVaultPrices = (vaultName: string): VaultPrices => {
	const bao = useBao()
	const { chainId } = useWeb3React()

	const oracle = useContract<VaultOracle>('VaultOracle', Config.vaults[vaultName].oracle)

	const enabled = !!bao && !!oracle && !!chainId
	const { data: prices, refetch } = useQuery(
		['@/hooks/vaults/useVaultPrices', { enabled, vaultName }],
		async () => {
			const tokens = Config.vaults[vaultName].markets.map(vault => vault.vaultAddresses[chainId])
			const multiCallContext = MultiCall.createCallContext([
				{
					ref: 'VaultOracle',
					contract: oracle,
					calls: tokens.map(token => ({
						ref: token,
						method: 'getUnderlyingPrice',
						params: [token],
					})),
				},
			])
			const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))
			return data['VaultOracle'].reduce(
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
