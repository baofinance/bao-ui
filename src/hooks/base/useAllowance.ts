import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useTransactionProvider from './useTransactionProvider'
import useContract from '@/hooks/base/useContract'
import type { Erc20 } from '@/typechain/index'

const useAllowance = (tokenAddress: string, spenderAddress: string) => {
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from(0))
	const contract = useContract<Erc20>('Erc20', tokenAddress)

	const fetchAllowance = useCallback(async () => {
		const _allowance = await contract.allowance(account, spenderAddress)
		setAllowance(_allowance)
	}, [contract, account, spenderAddress])

	useEffect(() => {
		if (!contract || !account) return
		fetchAllowance()
	}, [contract, account, tokenAddress, spenderAddress, transactions, fetchAllowance])

	return allowance
}

export default useAllowance
