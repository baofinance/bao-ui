import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

import useBaskets from './useBaskets'

type Prices = {
	[address: string]: BigNumber
}

const useGeckoPrices = (): Prices => {
	const { library, account, chainId } = useWeb3React()
	const baskets = useBaskets()

	const enabled = !!library && !!baskets
	const nids = baskets.map(b => b.nid)
	const { data: prices, refetch } = useQuery(
		['@/hooks/baskets/useGeckoPrices', providerKey(library, account, chainId), { enabled, nids }],
		async () => {
			const allCgIds: any = baskets.reduce((prev, cur) => {
				const reversedCgIds = Object.keys(cur.cgIds).reduce((_prev, _cur) => ({ ..._prev, [cur.cgIds[_cur]]: _cur }), {})
				return { ...prev, ...reversedCgIds }
			}, {})

			const idsToQuery = Object.keys(allCgIds).join(',')
			const res = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsToQuery}&vs_currencies=usd`)).json()

			return Object.keys(res).reduce(
				(prev, cur) => ({
					...prev,
					[allCgIds[cur].toLowerCase()]: parseUnits(res[cur].usd.toString()),
				}),
				{},
			)
		},
		{
			enabled,
			staleTime: 1000 * 60 * 3, // three minutes
			cacheTime: 1000 * 60 * 10, // ten minutes
			refetchOnReconnect: true,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return prices
}

export default useGeckoPrices
