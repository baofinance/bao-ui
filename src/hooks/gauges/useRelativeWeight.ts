import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useRelativeWeight = (gaugeAddress: string) => {
	const { library, account, chainId } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const enabled = !!library && !!gaugeController
	const { data: weight, refetch } = useQuery(
		['@/hooks/gauges/useRelativeWeight', providerKey(library, account, chainId), { enabled, gaugeAddress }],
		async () => {
			const block = await library.getBlock()
			const _weight = await gaugeController['gauge_relative_weight(address,uint256)'](gaugeAddress, block.timestamp)
			return _weight
		},
		{
			enabled,
			placeholderData: BigNumber.from('0'),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return weight
}

export default useRelativeWeight
