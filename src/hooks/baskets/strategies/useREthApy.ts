import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

// INFO: add to this to support new tokens

export const usePrice = (coingeckoId: string) => {
	const { data: price } = useQuery(
		['@/hooks/base/usePrice', { coingeckoId }],
		async () => {
			const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`)
			const price: { usd: number } = (await res.json())[coingeckoId]
			if (!price) throw new Error(`Can't get price for coinGeckoId='${coingeckoId}'.`)
			return fromDecimal(price.usd)
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

export default usePrice
