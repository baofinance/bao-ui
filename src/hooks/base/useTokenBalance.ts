import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getBalance } from '@/utils/erc20'

import useTransactionProvider from './useTransactionProvider'

const useTokenBalance = (tokenAddress: string) => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account, library } = useWeb3React()
	const { transactions } = useTransactionProvider()

	const fetchBalance = useCallback(async () => {
		if (tokenAddress === 'ETH') {
			const ethBalance = await library.getBalance(account)
			return setBalance(ethBalance)
		}

		const balance = await getBalance(library, tokenAddress, account)
		setBalance(BigNumber.from(balance))
	}, [account, library, tokenAddress])

	useEffect(() => {
		if (account && library && tokenAddress) {
			fetchBalance()
		}
	}, [transactions, account, library, tokenAddress])

	return balance
}

export default useTokenBalance
