import useBao from '@/hooks/base/useBao'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

export const useClaimedCheck = (nftAddress: string) => {
	const [isClaimed, setIsClaimed] = useState<any | undefined>()
	const { account } = useWeb3React()
	const bao = useBao()
	const { transactions } = useTransactionProvider()

	const nftContract = bao.getNewContract('nft.json', nftAddress)

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
