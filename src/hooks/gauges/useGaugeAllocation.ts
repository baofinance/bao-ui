import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useGaugeAllocation = (lpAddress: string) => {
	const { library, account, chainId } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const enabled = !!library && !!gaugeController
	const { data: allocation, refetch } = useQuery(
		['@/hooks/vebao/useGaugeAllocation', providerKey(library, account, chainId), { enabled, lpAddress }],
		async () => {
			const _allocation = await gaugeController.callStatic['gauge_relative_weight(address)'](lpAddress)
			return _allocation
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

	return allocation
}

export default useGaugeAllocation
