import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import useBlock from './useBlock'

interface BlockDiffOptions {
	firstDepositBlock: number
	lastWithdrawBlock: number
}

const useBlockDiff = (options: BlockDiffOptions) => {
	const { library, chainId, account } = useWeb3React()
	const block = useBlock()

	const enabled = !!library && !!block
	const { data: blockDiff } = useQuery(
		['@/hooks/base/useBlockDiff', providerKey(library, account, chainId), options, { block }],
		async () => {
			const { firstDepositBlock, lastWithdrawBlock } = options
			const firstOrLast = firstDepositBlock > lastWithdrawBlock ? firstDepositBlock : lastWithdrawBlock
			const _blockDiff = block - firstOrLast
			return _blockDiff
		},
		{
			enabled,
		},
	)

	return blockDiff > 0 && blockDiff
}

export default useBlockDiff
