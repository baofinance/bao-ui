import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import useBao from '../base/useBao'
import useBlock from '../base/useBlock'
import useFarms from './useFarms'

import useContract from '@/hooks/base/useContract'
import type { Masterchef, Weth } from '@/typechain/index'

const useAllEarnings = () => {
	const [balances, setBalance] = useState([] as Array<BigNumber>)
	const { account } = useWeb3React()
	const bao = useBao()
	const farms = useFarms()
	const masterChefContract = useContract<Masterchef>('Masterchef')
	const block = useBlock()

	const fetchAllBalances = useCallback(async () => {
		const balances: Array<BigNumber> = await Promise.all(
			farms.map(({ pid }: { pid: number }) => masterChefContract.pendingReward(pid, account)),
		)
		setBalance(balances)
	}, [account, farms, masterChefContract])

	useEffect(() => {
		if (account && farms && masterChefContract && bao) {
			fetchAllBalances()
		}
	}, [fetchAllBalances, account, farms, block, masterChefContract, setBalance, bao])

	return balances
}

export default useAllEarnings
