import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import useTransactionProvider from '@/hooks/base/useTransactionProvider'

import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'

type GaugeInfo = {
	totalSupply: BigNumber
	futureEpochTime: BigNumber
	workingSupply: BigNumber
	period: BigNumber
	inflationRate: BigNumber
}

const useGaugeInfo = (gauge: ActiveSupportedGauge): GaugeInfo => {
	const [info, setInfo] = useState<GaugeInfo | undefined>()
	const bao = useBao()

	const fetchGaugeInfo = useCallback(async () => {
		const supply = await gauge.gaugeContract.methods.totalSupply().call()
		const futureEpoch = await gauge.gaugeContract.methods.future_epoch_time().call()
		const workingSupply = await gauge.gaugeContract.methods.working_supply().call()
		const period = await gauge.gaugeContract.methods.period().call()
		const inflationRate = await gauge.gaugeContract.methods.inflation_rate().call()

		setInfo({
			totalSupply: new BigNumber(supply),
			futureEpochTime: new BigNumber(futureEpoch),
			workingSupply: new BigNumber(workingSupply),
			period: new BigNumber(period),
			inflationRate: new BigNumber(inflationRate),
		})
	}, [bao, gauge])

	useEffect(() => {
		if (!(bao && gauge)) return

		fetchGaugeInfo()
	}, [bao, gauge])

	return info
}

export default useGaugeInfo
