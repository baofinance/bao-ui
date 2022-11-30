import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

const useVotingPowerAllocated = () => {
	const { library, account, chainId } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const enabled = !!library && !!gaugeController
	const { data: votingPower, refetch } = useQuery(
		['@/hooks/gauges/useVotingPowerAllocated', providerKey(library, account, chainId), { enabled }],
		async () => {
			const _votingPower = await gaugeController.vote_user_power(account)
			return _votingPower
		},
		{
			enabled,
			refetchOnReconnect: true,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return votingPower
}

export default useVotingPowerAllocated
