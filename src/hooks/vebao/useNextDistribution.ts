import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import useContract from '@/hooks/base/useContract'
import type { FeeDistributor } from '@/typechain/index'

export const useNextDistribution = () => {
	const [nextDistribution, setNextDistribution] = useState<BigNumber | undefined>()

	const feeDistributor = useContract<FeeDistributor>('FeeDistributor')

	const fetchNextDistribution = useCallback(async () => {
		const nextFeeDistribution = await feeDistributor.last_token_time()
		setNextDistribution(nextFeeDistribution)
	}, [feeDistributor])

	useEffect(() => {
		if (!feeDistributor) return
		fetchNextDistribution()
	}, [feeDistributor, fetchNextDistribution])

	return nextDistribution
}
