import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import useBlock from './useBlock'

const useBlockDiff = (userInfo: any) => {
	const { account, library } = useWeb3React()
	const block = useBlock()
	const [blockDiff, setBlockDiff] = useState<number | undefined>()

	const fetchBlockDiff = useCallback(async () => {
		if (!(account && library && userInfo)) return

		const firstDepositBlock = new BigNumber(userInfo.firstDepositBlock)
		const lastWithdrawBlock = new BigNumber(userInfo.lastWithdrawBlock)

		const blockDiff = block - new BigNumber(firstDepositBlock.gt(lastWithdrawBlock) ? firstDepositBlock : lastWithdrawBlock).toNumber()
		setBlockDiff(blockDiff)
	}, [account, library, userInfo, block])

	useEffect(() => {
		fetchBlockDiff()
	}, [library, block, userInfo, fetchBlockDiff])

	return blockDiff > 0 && blockDiff
}

export default useBlockDiff
