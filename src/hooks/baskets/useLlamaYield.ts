import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

// INFO: add to this to support new tokens

export const useLlamaYield = (llamaPool: string) => {
	const { data: apy } = useQuery(
		['@/hooks/base/useLlamaYield', { llamaPool }],
		async () => {
			const res = await fetch(`https://yields.llama.fi/chart/${llamaPool}`)
			const _apy = (await res.json())[llamaPool]
			const recentApy = _apy[_apy.length - 1]
			if (!_apy) throw new Error(`Can't get yield for DeFi Llama Pool ${llamaPool}.`)
			return fromDecimal(_apy)
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

export default useLlamaYield
