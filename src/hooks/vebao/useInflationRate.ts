import { getInflationRate } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from 'web3-eth-contract'
import useBao from '../base/useBao'

const useInflationRate = (gaugeContract: Contract) => {
	const [inflationRate, setInflationRate] = useState(new BigNumber(0))
	const bao = useBao()

	const fetchInflationRate = useCallback(async () => {
		const inflationRate = await getInflationRate(gaugeContract)
		setInflationRate(new BigNumber(inflationRate))
	}, [gaugeContract, bao])

	useEffect(() => {
		if (gaugeContract && bao) {
			fetchInflationRate()
		}
	}, [gaugeContract, setInflationRate, bao])

	return inflationRate
}

export default useInflationRate
