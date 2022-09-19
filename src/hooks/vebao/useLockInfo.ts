import { getVotingEscrowContract } from '@/bao/utils'
import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useTransactionHandler from '../base/useTransactionHandler'

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
	const transactions = useTransactionHandler()

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
			balance: res[0].values[0],
			totalSupply: res[1].values[0],
			lockAmount: res[2].values[0],
			lockEnd: res[2].values[1],
		})
	}, [bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchLockInfo()
	}, [bao, account])

	return lockInfo
}

export default useLockInfo
