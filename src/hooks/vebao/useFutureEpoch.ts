import { getFutureEpoch } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useFutureEpoch = () => {
	const [futureEpoch, setFutureEpoch] = useState(new BigNumber(0))
	const bao = useBao()
	const tokenContract = bao.contracts.getContract('crv')

	const fetchTimestamp = useCallback(async () => {
		const futureEpoch = await getFutureEpoch(tokenContract)
		setFutureEpoch(new BigNumber(futureEpoch))
	}, [bao])

	useEffect(() => {
		if (tokenContract && bao) {
			fetchTimestamp()
		}
	}, [setFutureEpoch, bao])

	return futureEpoch
}

export default useFutureEpoch
