import { getCrvContract } from '@/bao/utils'
import Multicall from '@/utils/multicall'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

type RewardsInfo = {
	start: BigNumber
	future: BigNumber
}

const useEpochTime = (): RewardsInfo => {
	const [epochTime, setEpochTime] = useState<RewardsInfo | undefined>()
	const bao = useBao()

	const fetchEpochTime = useCallback(async () => {
		const tokenContract = getCrvContract(bao)
		const query = Multicall.createCallContext([
			{
				contract: tokenContract,
				ref: 'bao',
				calls: [
					{
						method: 'start_epoch_time_write',
					},
					{
						method: 'future_epoch_time_write',
					},
				],
			},
		])

		const { bao: res } = Multicall.parseCallResults(await bao.multicall.call(query))

		setEpochTime({
			start: new BigNumber(res[0].values[0].hex),
			future: new BigNumber(res[1].values[0].hex),
		})
	}, [bao])

	useEffect(() => {
		if (!bao) return

		fetchEpochTime()
	}, [bao])

	return epochTime
}

export default useEpochTime
