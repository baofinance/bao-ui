import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getTotalLPWethValue } from '@/bao/utils'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import useFarms from '@/hooks/farms/useFarms'
import { getContract } from '@/utils/erc20'

import useContract from '@/hooks/base/useContract'
import type { Masterchef, Weth } from '@/typechain/index'

export interface StakedValue {
	tokenAmount: BigNumber
	wethAmount: BigNumber
	totalWethValue: BigNumber
	tokenPriceInWeth: BigNumber
	poolWeight: BigNumber
}

const useAllStakedValue = (): StakedValue[] => {
	const [balances, setBalance] = useState([] as Array<StakedValue>)
	const { account, library } = useWeb3React()
	const farms = useFarms()
	const masterChefContract = useContract<Masterchef>('Masterchef')
	const wethContract = useContract<Weth>('Weth')
	const { transactions } = useTransactionProvider()

	const fetchAllStakedValue = useCallback(async () => {
		const balances: Array<StakedValue> = await Promise.all(
			farms.map(({ pid, lpContract, tokenAddress, tokenDecimals }) => {
				const farmContract = getContract(library, tokenAddress)
				return getTotalLPWethValue(masterChefContract, wethContract, lpContract, farmContract, tokenDecimals, pid)
			}),
		)

		setBalance(balances)
	}, [masterChefContract, library, farms, wethContract])

	useEffect(() => {
		if (account && masterChefContract && library) {
			fetchAllStakedValue()
		}
	}, [fetchAllStakedValue, account, transactions, masterChefContract, setBalance, library])

	return balances
}

export default useAllStakedValue
