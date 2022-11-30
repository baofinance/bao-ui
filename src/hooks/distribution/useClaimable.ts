import useContract from '@/hooks/base/useContract'
import { useQuery } from '@tanstack/react-query'
import type { BaoDistribution } from '@/typechain/BaoDistribution'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useClaimable = () => {
	const { account, library, chainId } = useWeb3React()
	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const enabled = !!account && !!distribution
	const { data: claimable, refetch } = useQuery(
		['@/hooks/distribution/useClaimable', providerKey(library, account, chainId), { enabled }],
		async () => {
			try {
				const claimable = await distribution.claimable(account, 0)
				return claimable
			} catch (e: any) {
				if (e.errorSignature === 'DistributionEndedEarly()') {
					return false
				}
			}
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return claimable
}

export default useClaimable
