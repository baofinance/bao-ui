import { ActiveSupportedGauge } from '@/bao/lib/types'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '../base/useBlock'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

type UserSlopes = {
	slope: BigNumber
	power: BigNumber
	end: BigNumber
}

const useUserSlopes = (gauge: ActiveSupportedGauge): UserSlopes => {
	const { library, account, chainId } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const enabled = !!library && !!gaugeController
	const { data: userSlopes, refetch } = useQuery(
		['@/hooks/vebao/useUserSlopes', providerKey(library, account, chainId), { enabled }],
		async () => {
			const { slope, power, end } = await gaugeController.vote_user_slopes(account, gauge.gaugeAddress)
			return { slope, power, end }
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return userSlopes
}

export default useUserSlopes
