import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

// INFO: add to this to support new tokens

export const useLlama = (llamaId: string) => {
	const { data: apy } = useQuery(
		['@/hooks/vaults/useLlama', { llamaId }],
		async () => {
			const res = await fetch(`https://yields.llama.fi/chart/${llamaId}`)
			const apy = await res.json()
			if (!apy) throw new Error(`Can't get APY for llamaId='${llamaId}'.`)
			return fromDecimal(apy)
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

	return apy
}

export default useLlama
