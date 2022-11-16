import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { useQuery } from '@tanstack/react-query'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useWeb3React } from '@web3-react/core'

const useRelativeWeight = (gaugeAddress: string) => {
	const [weight, setWeight] = useState(BigNumber.from(0))
	const { library } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const { data: block } = useQuery(['timestamp'], async () => {
		const block = await library?.getBlock()
		return block
	})
	console.log('timestamp', block?.timestamp)

	const fetchRelativeWeight = useCallback(async () => {
		const weight = await gaugeController['gauge_relative_weight(address,uint256)'](gaugeAddress, block?.timestamp)
		setWeight(weight)
	}, [gaugeController, gaugeAddress])

	useEffect(() => {
		if (gaugeController) {
			fetchRelativeWeight()
		}
	}, [fetchRelativeWeight, gaugeController])

	return weight
}

export default useRelativeWeight
