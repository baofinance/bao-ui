import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

// INFO: add to this to support new tokens

export const useStEthApy = () => {
	const { data: apy } = useQuery(
		['@/hooks/baskets/strategies/useStEthApy', {}],
		async () => {
			const res = await fetch(`https://stake.lido.fi/api/steth-apr`)
			const apy = await res.json()
			if (!apy) throw new Error(`Can't get APY for stETH'.`)
			return apy
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

	return apy
}

export default useStEthApy
