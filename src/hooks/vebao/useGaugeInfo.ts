import Multicall from '@/utils/multicall'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'

type GaugeInfo = {
	totalSupply: BigNumber
	inflationRate: BigNumber
}

const useGaugeInfo = (gauge: ActiveSupportedGauge): GaugeInfo => {
	const [gaugeInfo, setGaugeInfo] = useState<GaugeInfo | undefined>()
	const bao = useBao()

	const fetchGaugeInfo = useCallback(async () => {
		const gaugeContract = gauge.gaugeContract
		const query = Multicall.createCallContext([
			{
				contract: gaugeContract,
				ref: 'gauge',
				calls: [
					{
						method: 'totalSupply',
					},
					{
						method: 'inflation_rate',
					},
				],
			},
		])

		const { gauge: res } = Multicall.parseCallResults(await bao.multicall.call(query))

		setGaugeInfo({
			totalSupply: new BigNumber(res[0].values[0].hex),
			inflationRate: new BigNumber(res[1].values[0].hex),
		})
	}, [bao, gauge])

	useEffect(() => {
		if (!(bao && gauge)) return

		fetchGaugeInfo()
	}, [bao, gauge])

	return gaugeInfo
}

export default useGaugeInfo
