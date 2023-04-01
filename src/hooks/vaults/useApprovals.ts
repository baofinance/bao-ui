import { BigNumber } from 'ethers'
import MultiCall from '@/utils/multicall'
import useBao from '@/hooks/base/useBao'
import { useVaults } from './useVaults'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useEffect } from 'react'

type Approvals = {
	approvals: { [key: string]: BigNumber }
}

export const useApprovals = (vaultName: string): Approvals => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const vaults = useVaults(vaultName)

	const enabled = !!bao && !!vaults && !!account
	const { data: approvals, refetch } = useQuery(
		['@/hooks/vaults/useApprovals', providerKey(library, account, chainId), { enabled }],
		async () => {
			const multicallContext = MultiCall.createCallContext(
				vaults
					.map(
						vault =>
							vault.underlyingAddress !== 'ETH' && {
								ref: vault.underlyingAddress,
								contract: vault.underlyingContract,
								calls: [
									{
										method: 'allowance',
										params: [account, vault.vaultAddress],
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

	useEffect(() => {
		_refetch()
	}, [vaultName])

	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return {
		approvals,
	}
}
