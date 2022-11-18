import { ActiveSupportedGauge } from '@/bao/lib/types'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useState } from 'react'
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

	const enabled = !!gaugeController
	const { data: userSlopes, refetch } = useQuery(
		['@/hooks/vebao/useUserSlopes', providerKey(library, account, chainId)],
		async () => {
			const _userSlopes = await gaugeController.vote_user_slopes(account, gauge.gaugeAddress)
			return {
				slope: _userSlopes[0],
				power: _userSlopes[1],
				end: _userSlopes[2],
			}
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

	return userSlopes
}

export default useUserSlopes
