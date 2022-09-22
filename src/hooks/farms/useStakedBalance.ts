import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getMasterChefContract, getStaked } from '@/bao/utils'

import useBao from '../base/useBao'

const useStakedBalance = (pid: number) => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const bao = useBao()
	const masterChefContract = getMasterChefContract(bao)

	const fetchBalance = useCallback(async () => {
		const balance = await getStaked(masterChefContract, pid, account)
		const userBalance = BigNumber.from(balance)
		//setBalance(userBalance.decimalPlaces(18))
		setBalance(userBalance) // FIXME: this should handle decimals and formatting etc
	}, [pid, account, masterChefContract])

	useEffect(() => {
		if (account && bao) {
			fetchBalance()
		}
	}, [account, bao, fetchBalance])

	//return balance.decimalPlaces(18)
	return balance // FIXME: this should handle decimals and formatting etc
}

export default useStakedBalance
