import { getGaugeControllerContract, getGaugeWeight } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useGaugeWeight = (lpAddress: string) => {
	const [weight, setWeight] = useState(new BigNumber(0))
	const bao = useBao()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	const fetchGaugeWeight = useCallback(async () => {
		const weight = await getGaugeWeight(gaugeControllerContract, lpAddress)
		setWeight(new BigNumber(weight))
	}, [gaugeControllerContract, bao])

	useEffect(() => {
		if (gaugeControllerContract && bao) {
			fetchGaugeWeight()
		}
	}, [gaugeControllerContract, setWeight, bao])

	return weight
}

export default useGaugeWeight
