import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getEarned, getMasterChefContract } from '@/bao/utils'

import useBao from '../base/useBao'
import useBlock from '../base/useBlock'

const useEarnings = (pid: number) => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const bao = useBao()
	const masterChefContract = getMasterChefContract(bao)
	const block = useBlock()

	const fetchBalance = useCallback(async () => {
		const balance = await getEarned(masterChefContract, pid, account)
		setBalance(BigNumber.from(balance))
	}, [account, pid, masterChefContract])

	useEffect(() => {
		if (account && masterChefContract && bao) {
			fetchBalance()
		}
	}, [account, block, masterChefContract, setBalance, bao])

	return balance
}

export default useEarnings
