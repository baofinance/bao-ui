import { getGaugeAllocation, getGaugeControllerContract } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useGaugeAllocation = (lpAddress: string) => {
	const [allocation, setAllocation] = useState(new BigNumber(0))
	const bao = useBao()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	const fetchAllocation = useCallback(async () => {
		const allocation = await getGaugeAllocation(gaugeControllerContract, lpAddress)
		setAllocation(new BigNumber(allocation))
	}, [gaugeControllerContract, bao])

	useEffect(() => {
		if (gaugeControllerContract && bao) {
			fetchAllocation()
		}
	}, [gaugeControllerContract, setAllocation, bao])

	return allocation
}

export default useGaugeAllocation
