import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import { decimate } from '@/utils/numberFormat'

import { getFeeDistributorContract } from '@/bao/utils'
import useBao from '../base/useBao'

export const useNextDistribution = () => {
	const [nextDistribution, setNextDistribution] = useState<BigNumber | undefined>()
	const bao = useBao()
	const feeDistributionContract = getFeeDistributorContract(bao)

	const fetchNextDistribution = useCallback(async () => {
		const nextFeeDistribution = decimate(await feeDistributionContract.methods.last_token_time().call())
		setNextDistribution(nextFeeDistribution)
	}, [bao])

	useEffect(() => {
		if (!bao) return

		fetchNextDistribution()
	}, [bao])

	return nextDistribution
}
