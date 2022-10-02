import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useTransactionProvider from './useTransactionProvider'
import useContract from '@/hooks/base/useContract'
import type { Erc20 } from '@/typechain/index'

const useTokenBalance = (tokenAddress: string) => {
	const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
	const { library, account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const contract = useContract<Erc20>('Erc20', tokenAddress)

	const fetchBalance = useCallback(async () => {
		let balance
		if (tokenAddress === 'ETH') {
			balance = await library.getBalance(account)
		} else {
			balance = await contract.balanceOf(account)
		}
		setBalance(balance)
	}, [library, contract, account, tokenAddress])

	useEffect(() => {
		if (!library || !account || !contract) return
		fetchBalance()
	}, [fetchBalance, library, contract, account, tokenAddress, transactions])

	return balance
}

export default useTokenBalance
