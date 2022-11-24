import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { FeeDistributor } from '@/typechain/FeeDistributor'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import useContract from '../base/useContract'

const useClaimableFees = () => {
	const { library, account, chainId } = useWeb3React()
	const feeDistributor = useContract<FeeDistributor>('FeeDistributor')
	const enabled = !!feeDistributor && !!account

	const { data: claimableFees, refetch } = useQuery(
		['@/hooks/vebao/useClaimableFees', providerKey(library, account, chainId)],
		async () => {
			const _claimableFees = await feeDistributor.callStatic['claim(address)'](account)
			return _claimableFees
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

	return claimableFees
}

export default useClaimableFees
