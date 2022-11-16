import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'
import { fromDecimal } from '@/utils/numberFormat'

// INFO: add to this to support new tokens
type CoinGeckId = 'bao-finance' | 'curve-dao-token' | 'lp-3pool-curve' | 'dai' | 'ethereum'

export const usePrice = (coinGeckoId: CoinGeckId) => {
	const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`
	const { data: price } = useQuery(
		[priceUrl],
		async () => {
			const res = await fetch(priceUrl)
			const price: { usd: number } = (await res.json())[coinGeckoId]
			if (!price) throw new Error(`Can't get price for ${coinGeckoId} @ ${priceUrl}`)
			return fromDecimal(price.usd)
		},
		{
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: BigNumber.from(0),
		},
	)

	return price
}

export default usePrice
