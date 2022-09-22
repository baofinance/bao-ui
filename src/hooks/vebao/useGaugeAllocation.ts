import { getGaugeControllerContract, getRelativeWeight } from '@/bao/utils'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useGaugeAllocation = (lpAddress: string) => {
	const [allocation, setAllocation] = useState(BigNumber.from(0))
	const bao = useBao()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	const fetchGaugeAllocation = useCallback(async () => {
		const allocation = await getRelativeWeight(gaugeControllerContract, lpAddress)
		setAllocation(BigNumber.from(allocation))
	}, [gaugeControllerContract, bao])

	useEffect(() => {
		if (gaugeControllerContract && bao) {
			fetchGaugeAllocation()
		}
	}, [gaugeControllerContract, bao])

	return allocation
}

export default useGaugeAllocation
