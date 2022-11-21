import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import useBlock from './useBlock'

interface BlockDiffOptions {
	firstDepositBlock: number
	lastWithdrawBlock: number
}

const useBlockDiff = (options: BlockDiffOptions) => {
	const { library } = useWeb3React()
	const block = useBlock()
	const [blockDiff, setBlockDiff] = useState<number>(0)

	const fetchBlockDiff = useCallback(async () => {
		const { firstDepositBlock, lastWithdrawBlock } = options
		const firstOrLast = firstDepositBlock > lastWithdrawBlock ? firstDepositBlock : lastWithdrawBlock
		const blockDiff = block - firstOrLast
		setBlockDiff(blockDiff)
	}, [block, options])

	useEffect(() => {
		if (!library || !options) return
		fetchBlockDiff()
	}, [fetchBlockDiff, library, block, options])

	return blockDiff > 0 && blockDiff
}

export default useBlockDiff
