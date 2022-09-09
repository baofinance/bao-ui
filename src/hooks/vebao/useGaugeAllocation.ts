import { getGaugeControllerContract, getRelativeWeight } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useGaugeAllocation = (lpAddress: string) => {
	const [allocation, setAllocation] = useState(new BigNumber(0))
	const bao = useBao()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	const fetchGaugeAllocation = useCallback(async () => {
		const allocation = await getRelativeWeight(gaugeControllerContract, lpAddress)
		setAllocation(new BigNumber(allocation))
	}, [gaugeControllerContract, bao])

	useEffect(() => {
		if (gaugeControllerContract && bao) {
			fetchGaugeAllocation()
		}
	}, [gaugeControllerContract, setAllocation, bao])

	return allocation
}

export default useGaugeAllocation
