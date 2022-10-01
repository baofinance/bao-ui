import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBlock from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import type { Masterchef } from '@/typechain/index'

const useEarnings = (pid: number) => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const masterChefContract = useContract<Masterchef>('Masterchef')
	const block = useBlock()

	const fetchBalance = useCallback(async () => {
		const balance = await masterChefContract.pendingReward(pid, account)
		setBalance(balance)
	}, [account, pid, masterChefContract])

	useEffect(() => {
		if (!account || !masterChefContract) return
		fetchBalance()
	}, [fetchBalance, account, block, masterChefContract, setBalance])

	return balance
}

export default useEarnings
