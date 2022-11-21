import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useContract from '@/hooks/base/useContract'
import type { Masterchef } from '@/typechain/index'

const useStakedBalance = (pid: number) => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const masterChefContract = useContract<Masterchef>('Masterchef')

	const fetchBalance = useCallback(async () => {
		const { amount } = await masterChefContract.userInfo(pid, account)
		//setBalance(userBalance.decimalPlaces(18))
		setBalance(amount) // FIXME: this should handle decimals and formatting etc
	}, [pid, account, masterChefContract])

	useEffect(() => {
		if (!account || !masterChefContract) return
		fetchBalance()
	}, [fetchBalance, account, masterChefContract])

	//return balance.decimalPlaces(18)
	return balance // FIXME: this should handle decimals and formatting etc
}

export default useStakedBalance
