import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import { getFarms, getMasterChefContract, getTotalLPWethValue, getWethContract } from '@/bao/utils'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { getContract } from '@/utils/erc20'

import useBao from '../base/useBao'

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
	const bao = useBao()
	const farms = getFarms(bao)
	const masterChefContract = getMasterChefContract(bao)
	const wethContract = getWethContract(bao)
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
	}, [account, transactions, masterChefContract, setBalance, library, fetchAllStakedValue])

	return balances
}

export default useAllStakedValue
