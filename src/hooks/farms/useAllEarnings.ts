import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getEarned, getFarms, getMasterChefContract } from '@/bao/utils'

import useBao from '../base/useBao'
import useBlock from '../base/useBlock'

const useAllEarnings = () => {
	const [balances, setBalance] = useState([] as Array<BigNumber>)
	const { account } = useWeb3React()
	const bao = useBao()
	const farms = getFarms(bao)
	const masterChefContract = getMasterChefContract(bao)
	const block = useBlock()

	const fetchAllBalances = useCallback(async () => {
		const balances: Array<BigNumber> = await Promise.all(
			farms.map(({ pid }: { pid: number }) => getEarned(masterChefContract, pid, account)),
		)
		setBalance(balances)
	}, [account, farms, masterChefContract])

	useEffect(() => {
		if (account && masterChefContract && bao) {
			fetchAllBalances()
		}
	}, [account, block, masterChefContract, setBalance, bao, fetchAllBalances])

	return balances
}

export default useAllEarnings
