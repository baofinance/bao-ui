import useContract from '@/hooks/base/useContract'
import type { FeeDistributor } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useNextDistribution = () => {
	const { library, account, chainId } = useWeb3React()
	const feeDistributor = useContract<FeeDistributor>('FeeDistributor')

	const enabled = !!library && !!feeDistributor
	const { data: nextDistribution, refetch } = useQuery(
		['@/hooks/vebao/useNextDistribution', providerKey(library, account, chainId), { enabled }],
		async () => {
			const _nextDistribution = await feeDistributor.last_token_time()
			return _nextDistribution
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

	return nextDistribution
}
