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

	const enabled = !!gaugeController
	const { data: allocation, refetch } = useQuery(
		['@/hooks/vebao/useGaugeAllocation', providerKey(library, account, chainId), lpAddress],
		async () => {
			const _allocation = await gaugeController.callStatic['gauge_relative_weight(address)'](lpAddress)
			return _allocation
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) setTimeout(refetch, 0)
	}

	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return allocation || BigNumber.from(0)
}

export default useGaugeAllocation
