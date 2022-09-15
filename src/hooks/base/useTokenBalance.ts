import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import { getBalance } from '@/utils/erc20'

import useBao from './useBao'
import useTransactionProvider from './useTransactionProvider'

const useTokenBalance = (tokenAddress: string) => {
	const [balance, setBalance] = useState(new BigNumber(0))
	const { account, library } = useWeb3React()
	const { transactions } = useTransactionProvider()

	const fetchBalance = useCallback(async () => {
		if (tokenAddress === 'ETH') {
			const ethBalance = await library.getBalance(account)
			return setBalance(new BigNumber(ethBalance.toString()))
		}

		const balance = await getBalance(library, tokenAddress, account)
		setBalance(new BigNumber(balance))
	}, [account, library, tokenAddress])

	useEffect(() => {
		if (account && library && tokenAddress) {
			fetchBalance()
		}
	}, [transactions, account, library, tokenAddress])

	return balance
}

export default useTokenBalance
