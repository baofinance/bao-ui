import useBao from '@/hooks/base/useBao'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from 'web3-eth-contract'

export const useClaimedCheck = (nftContract: Contract) => {
	const [isClaimed, setIsClaimed] = useState<any | undefined>()
	const { account } = useWeb3React()
	const bao = useBao()
	const { transactions } = useTransactionProvider()

	const fetchWhitelistClaimed = useCallback(async () => {
		const _isClaimed = await nftContract.methods.whitelistClaimed(account).call()
		setIsClaimed(_isClaimed)
	}, [nftContract, account])

	useEffect(() => {
		if (account && bao) {
			fetchWhitelistClaimed()
		}
	}, [bao, account, transactions, fetchWhitelistClaimed])

	return isClaimed
}
