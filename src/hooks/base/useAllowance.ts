import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getAllowance } from '@/utils/erc20'

import useBao from './useBao'
import useTransactionProvider from './useTransactionProvider'

const useAllowance = (tokenAddress: string, spenderAddress: string) => {
	const { account } = useWeb3React()
	const bao = useBao()
	const { transactions } = useTransactionProvider()

	const [allowance, setAllowance] = useState<BigNumber | undefined>()

	const _getAllowance = useCallback(async () => {
		try {
			const tokenContract = bao.getNewContract(tokenAddress, 'erc20.json')
			const _allowance = await getAllowance(tokenContract, account, spenderAddress)
			setAllowance(BigNumber.from(_allowance))
		} catch (e) {
			setAllowance(BigNumber.from(0))
		}
	}, [bao, account, tokenAddress, spenderAddress])

	useEffect(() => {
		_getAllowance()
	}, [bao, account, tokenAddress, spenderAddress, transactions, _getAllowance])

	return allowance
}

export default useAllowance
