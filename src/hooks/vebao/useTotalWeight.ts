import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

const useTotalWeight = () => {
	const [weight, setWeight] = useState(BigNumber.from(0))
	const gaugeController = useContract<GaugeController>('GaugeController')

	const fetchTotalWeight = useCallback(async () => {
		const weight = await gaugeController.get_total_weight()
		setWeight(weight)
	}, [gaugeController])

	useEffect(() => {
		if (gaugeController) {
			fetchTotalWeight()
		}
	}, [fetchTotalWeight, gaugeController])

	return weight
}

export default useTotalWeight
