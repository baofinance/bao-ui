import { BigNumber } from 'ethers'
import MultiCall from '@/utils/multicall'
import useBao from '@/hooks/base/useBao'
import { useMarkets } from './useMarkets'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

type Approvals = {
	approvals: { [key: string]: BigNumber }
}

export const useApprovals = (marketName: string): Approvals => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const markets = useMarkets(marketName)

	const enabled = !!bao && !!markets && !!account
	const { data: approvals, refetch } = useQuery(
		['@/hooks/markets/useApprovals', providerKey(library, account, chainId), { enabled }],
		async () => {
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

			return Object.keys(multicallResults).reduce(
				(approvals: { [key: string]: BigNumber }, address: string) => ({
					...approvals,
					[address]: BigNumber.from(multicallResults[address][0].values[0]),
				}),
				{},
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return {
		approvals,
	}
}
