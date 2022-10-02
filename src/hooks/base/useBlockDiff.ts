import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import useBlock from './useBlock'

const useBlockDiff = (userInfo: any) => {
	const { library } = useWeb3React()
	const block = useBlock()
	const [blockDiff, setBlockDiff] = useState<number | undefined>()

	const fetchBlockDiff = useCallback(async () => {
		const firstDepositBlock = userInfo.firstDepositBlock
		const lastWithdrawBlock = userInfo.lastWithdrawBlock
		const firstOrLast = firstDepositBlock > lastWithdrawBlock ? firstDepositBlock : lastWithdrawBlock
		const blockDiff = block - firstOrLast
		setBlockDiff(blockDiff)
	}, [block, userInfo])

	useEffect(() => {
		if (!library || !userInfo) return
		fetchBlockDiff()
	}, [fetchBlockDiff, library, block, userInfo])

	return blockDiff > 0 && blockDiff
}

export default useBlockDiff
