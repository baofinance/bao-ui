import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

// INFO: add to this to support new tokens

export const useLlama = (llamaId: string) => {
	const { data: pool } = useQuery(
		['@/hooks/base/usePrice', { llamaId }],
		async () => {
			const res = await fetch(`https://yields.llama.fi/chart/${llamaId}`)
			const pool = (await res.json())[llamaId]
			if (!pool) throw new Error(`Can't get APR for Defi Llama Pool='${llamaId}'.`)
			return pool
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

	return pool
}

export default useLlama
