import { getVotingEscrowContract } from '@/bao/utils'
import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'

type LockInfo = {
	balance: BigNumber
	totalSupply: BigNumber
	lockAmount: BigNumber
	lockEnd: BigNumber
}

const useLockInfo = (): LockInfo => {
	const [lockInfo, setLockInfo] = useState<LockInfo | undefined>()
	const bao = useBao()
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()

	const fetchLockInfo = useCallback(async () => {
		const votingEscrowContract = getVotingEscrowContract(bao)

		const query = Multicall.createCallContext([
			{
				contract: votingEscrowContract,
				ref: 'votingEscrow',
				calls: [
					{
						method: 'balanceOf',
						params: [account],
					},
					{
						method: 'totalSupply',
					},
					{
						method: 'locked',
						params: [account],
					},
				],
			},
		])

		const { votingEscrow: res } = Multicall.parseCallResults(await bao.multicall.call(query))

		setLockInfo({
			balance: new BigNumber(res[0].values[0].hex),
			totalSupply: new BigNumber(res[1].values[0].hex),
			lockAmount: new BigNumber(res[2].values[0].hex),
			lockEnd: new BigNumber(res[2].values[1].hex),
		})
	}, [bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchLockInfo()
	}, [bao, account, transactions])

	return lockInfo
}

export default useLockInfo
