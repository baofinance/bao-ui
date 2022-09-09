import { getCurrentEpoch } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useCurrentEpoch = () => {
	const [currentEpoch, setCurrentEpoch] = useState(new BigNumber(0))
	const bao = useBao()
	const tokenContract = bao.contracts.getContract('crv')

	const fetchTimestamp = useCallback(async () => {
		const currentEpoch = await getCurrentEpoch(tokenContract)
		setCurrentEpoch(new BigNumber(currentEpoch))
	}, [bao])

	useEffect(() => {
		if (tokenContract && bao) {
			fetchTimestamp()
		}
	}, [setCurrentEpoch, bao])

	return currentEpoch
}

export default useCurrentEpoch
