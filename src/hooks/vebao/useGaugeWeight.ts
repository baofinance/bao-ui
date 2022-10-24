import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'

const useGaugeWeight = (lpAddress: string) => {
	const [weight, setWeight] = useState(BigNumber.from(0))
	const gaugeController = useContract<GaugeController>('GaugeController')

	const fetchGaugeWeight = useCallback(async () => {
		const weight = await gaugeController.get_gauge_weight(lpAddress)
		setWeight(weight)
	}, [gaugeController, lpAddress])

	useEffect(() => {
		if (gaugeController) {
			fetchGaugeWeight()
		}
	}, [fetchGaugeWeight, gaugeController])

	return weight
}

export default useGaugeWeight
