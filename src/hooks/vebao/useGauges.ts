import { ActiveSupportedGauge } from '@/bao/lib/types'
import { getGauges } from '@/bao/utils'
import useBao from '@/hooks/base/useBao'
import { useEffect, useState } from 'react'

const useGauges = (): ActiveSupportedGauge[] => {
	const [gauges, setGauges] = useState<ActiveSupportedGauge[] | undefined>()
	const bao = useBao()

	useEffect(() => {
		if (bao) setGauges(getGauges(bao))
	}, [bao])

	return gauges
}

export default useGauges
