import { getGaugeControllerContract, getGaugeWeight } from '@/bao/utils'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useGaugeWeight = (lpAddress: string) => {
	const [weight, setWeight] = useState(BigNumber.from(0))
	const bao = useBao()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	const fetchGaugeWeight = useCallback(async () => {
		const weight = await getGaugeWeight(gaugeControllerContract, lpAddress)
		setWeight(BigNumber.from(weight))
	}, [gaugeControllerContract, bao])

	useEffect(() => {
		if (gaugeControllerContract && bao) {
			fetchGaugeWeight()
		}
	}, [gaugeControllerContract, bao])

	return weight
}

export default useGaugeWeight
