import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import MultiCall from 'utils/multicall'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import { useMarkets } from './useMarkets'
import { useWeb3React } from '@web3-react/core'

type Approvals = {
	approvals: { [key: string]: BigNumber }
}

export const useApprovals = (pendingTx: string | boolean): Approvals => {
	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const { account } = useWeb3React()
	const markets = useMarkets()
	const [approvals, setApprovals] = useState<{ [key: string]: BigNumber } | undefined>()

	const fetchApprovals = useCallback(async () => {
		const multicallContext = MultiCall.createCallContext(
			markets
				.map(
					market =>
						market.underlyingAddress !== 'ETH' && {
							ref: market.underlyingAddress,
							contract: market.underlyingContract,
							calls: [
								{
									method: 'allowance',
									params: [account, market.marketAddress],
								},
							],
						},
				)
				.filter(call => call),
		)
		const multicallResults = MultiCall.parseCallResults(await bao.multicall.call(multicallContext))

		setApprovals(
			Object.keys(multicallResults).reduce(
				(approvals: { [key: string]: BigNumber }, address: any) => ({
					...approvals,
					[address]: new BigNumber(multicallResults[address][0].values[0].hex),
				}),
				{},
			),
		)
	}, [transactions, bao, account, markets, pendingTx])

	useEffect(() => {
		if (!(bao && account && markets)) return
		fetchApprovals()
	}, [transactions, bao, account, markets, pendingTx])

	return {
		approvals,
	}
}
