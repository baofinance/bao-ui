import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import type { VotingEscrow } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'

export type VeInfo = {
	supply: BigNumber
	totalSupply: BigNumber
}

const useVeInfo = (): VeInfo => {
	const bao = useBao()
	const { library, chainId } = useWeb3React()
	const votingEscrow = useContract<VotingEscrow>('VotingEscrow', Config.contracts.votingEscrow[chainId].address)

	// FIXME: let us get the totalSupply and supply without needing an account.
	const enabled = !!bao && !!votingEscrow
	const { data: veInfo, refetch } = useQuery(
		['@/hooks/vebao/useVeInfo', providerKey(library), { enabled }],
		async () => {
			const query = Multicall.createCallContext([
				{
					contract: votingEscrow,
					ref: 'votingEscrow',
					calls: [
						{
							method: 'totalSupply()',
						},
						{
							method: 'supply()',
						},
					],
				},
			])

			const { votingEscrow: res } = Multicall.parseCallResults(await bao.multicall.call(query))

			return {
				supply: res[0].values[0],
				totalSupply: res[1].values[0],
			}
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

	return veInfo
}

export default useVeInfo
