import { BigNumber } from 'ethers'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useGaugeWeight = (gaugeAddress: string) => {
	const { library, account, chainId } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const enabled = !!gaugeController
	const { data: weight, refetch } = useQuery(
		['@/hooks/vebao/useGaugeWeight', providerKey(library, account, chainId), gaugeAddress],
		async () => {
			const _weight = await gaugeController.get_gauge_weight(gaugeAddress)
			return _weight
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

	return weight || BigNumber.from(0)
}

export default useGaugeWeight
