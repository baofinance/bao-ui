import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

const useTotalWeight = () => {
	const gaugeController = useContract<GaugeController>('GaugeController')
	const { library, account, chainId } = useWeb3React()
	const enabled = !!chainId && !!gaugeController

	const { data: totalWeight, refetch } = useQuery(
		['@/hooks/gauges/useTotalWeight', providerKey(library, account, chainId), { enabled }],
		async () => {
			const weight = await gaugeController.get_total_weight()
			return weight
		},
		{
			enabled,
			refetchOnReconnect: true,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) setTimeout(refetch, 0)
	}

	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return totalWeight
}

export default useTotalWeight
