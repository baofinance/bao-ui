import { ActiveSupportedGauge } from '@/bao/lib/types'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useBlockUpdater } from '../base/useBlock'
import useTransactionProvider, { useTxReceiptUpdater } from '../base/useTransactionProvider'

type UserSlopes = {
	slope: BigNumber
	power: BigNumber
	end: BigNumber
}

const useUserSlopes = (gauge: ActiveSupportedGauge): UserSlopes => {
	const { library, account, chainId } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')
	const { transactions } = useTransactionProvider()
	const [userSlopes, setUserSlopes] = useState<UserSlopes | undefined>()

	const fetchUserSlopes = useCallback(async () => {
		const { slope, power, end } = await gaugeController.vote_user_slopes(account, gauge.gaugeAddress)
		setUserSlopes({ slope, power, end })
	}, [account, gaugeController, gauge])

	useEffect(() => {
		if (!library || !chainId || !gaugeController) return
		fetchUserSlopes()
	}, [fetchUserSlopes, library, account, chainId, transactions, gaugeController])

	return userSlopes
}

export default useUserSlopes
