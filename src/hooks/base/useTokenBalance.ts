import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useQuery } from '@tanstack/react-query'
import useTransactionProvider from './useTransactionProvider'
import useContract from '@/hooks/base/useContract'
import type { Erc20 } from '@/typechain/index'

export const useEthBalance = () => {
	const { library, chainId, account } = useWeb3React<Web3Provider>()
	const { transactions } = useTransactionProvider()
	const txs = Object.keys(transactions ? transactions : {}).length
	const { data: balance } = useQuery(
		['@/hooks/base/useEthBalance', { chainId, account, txs }],
		async () => {
			return await library.getBalance(account)
		},
		{
			enabled: !!library && !!chainId && !!account,
			placeholderData: BigNumber.from(0),
		},
	)

	return balance
}

const useTokenBalance = (tokenAddress: string) => {
	const { chainId, account } = useWeb3React<Web3Provider>()
	const { transactions } = useTransactionProvider()
	const contract = useContract<Erc20>('Erc20', tokenAddress)
	const txs = Object.keys(transactions ? transactions : {}).length
	const { data: balance } = useQuery(
		['@/hooks/base/useBalance', { chainId, account, txs }, tokenAddress],
		async () => {
			return await contract.balanceOf(account)
		},
		{
			enabled: !!contract && !!chainId && !!account,
			placeholderData: BigNumber.from(0),
		},
	)

	return balance
}

export default useTokenBalance
