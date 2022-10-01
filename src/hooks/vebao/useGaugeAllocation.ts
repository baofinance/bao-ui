import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'

const useGaugeAllocation = (lpAddress: string) => {
	const [allocation, setAllocation] = useState(BigNumber.from(0))
	const gaugeController = useContract<GaugeController>('GaugeController')

	const fetchGaugeAllocation = useCallback(async () => {
		const allocation = await gaugeController.callStatic['gauge_relative_weight(address)'](lpAddress)
		setAllocation(allocation)
	}, [gaugeController, lpAddress])

	useEffect(() => {
		if (!gaugeController) return
		fetchGaugeAllocation()
	}, [fetchGaugeAllocation, gaugeController])

	return allocation
}

export default useGaugeAllocation
