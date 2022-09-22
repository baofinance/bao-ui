import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
//import { useBlockNumber } from 'eth-hooks'

import useBlock from './useBlock'

const useBlockDiff = (userInfo: any) => {
	const { account, library } = useWeb3React()
	const block = useBlock()
	const [blockDiff, setBlockDiff] = useState<number | undefined>()

	const fetchBlockDiff = useCallback(async () => {
		if (!(account && library && userInfo)) return

		const firstDepositBlock = BigNumber.from(userInfo.firstDepositBlock)
		const lastWithdrawBlock = BigNumber.from(userInfo.lastWithdrawBlock)

		const blockDiff = block - BigNumber.from(firstDepositBlock.gt(lastWithdrawBlock) ? firstDepositBlock : lastWithdrawBlock).toNumber()
		setBlockDiff(blockDiff)
	}, [library, block, userInfo, account])

	useEffect(() => {
		fetchBlockDiff()
	}, [library, block, userInfo])

	return blockDiff > 0 && blockDiff
}

export default useBlockDiff
