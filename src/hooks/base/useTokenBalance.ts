import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useQuery } from '@tanstack/react-query'
import useContract from '@/hooks/base/useContract'
import { useBlockUpdater } from './useBlock'
import { useTxReceiptUpdater } from './useTransactionProvider'
import type { Erc20 } from '@/typechain/index'

export const useEthBalance = () => {
	const { library, chainId, account } = useWeb3React<Web3Provider>()
	const { data: balance, refetch } = useQuery(
		['@/hooks/base/useEthBalance', { chainId, account }],
		async () => {
			return await library.getBalance(account)
		},
		{
			enabled: !!library && !!chainId && !!account,
			placeholderData: BigNumber.from(0),
		},
	)

	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	return balance
}

const useTokenBalance = (tokenAddress: string) => {
	const { chainId, account } = useWeb3React<Web3Provider>()
	const contract = useContract<Erc20>('Erc20', tokenAddress)
	const { data: balance, refetch } = useQuery(
		['@/hooks/base/useBalance', { chainId, account }, tokenAddress],
		async () => {
			return await contract.balanceOf(account)
		},
		{
			enabled: !!contract && !!chainId && !!account,
			placeholderData: BigNumber.from(0),
		},
	)

	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	return balance
}

export default useTokenBalance
