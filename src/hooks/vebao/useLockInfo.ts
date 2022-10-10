import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import Config from '@/bao/lib/config'
import useContract from '@/hooks/base/useContract'
import type { VotingEscrow } from '@/typechain/index'

type LockInfo = {
	balance: BigNumber
	supply: BigNumber
	totalSupply: BigNumber
	lockAmount: BigNumber
	lockEnd: BigNumber
}

const useLockInfo = (): LockInfo => {
	const [lockInfo, setLockInfo] = useState<LockInfo | undefined>()
	const bao = useBao()
	// FIXME: let us get the totalSupply and supply without needing an account.
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const votingEscrow = useContract<VotingEscrow>('VotingEscrow', Config.contracts.votingEscrow[Config.networkId].address)

	const fetchLockInfo = useCallback(async () => {
		const query = Multicall.createCallContext([
			{
				contract: votingEscrow,
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
						method: 'supply',
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
			supply: res[1].values[0],
			totalSupply: res[2].values[0],
			lockAmount: res[3].values[0],
			lockEnd: res[3].values[1],
		})
	}, [bao, account, votingEscrow])

	useEffect(() => {
		if (!(bao && account && votingEscrow)) return

		fetchLockInfo()
	}, [fetchLockInfo, bao, account, transactions, votingEscrow])

	return lockInfo
}

export default useLockInfo
