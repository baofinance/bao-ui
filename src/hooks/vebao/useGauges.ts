import { ActiveSupportedGauge } from '@/bao/lib/types'
import Config from '@/bao/lib/config'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { Gauge__factory, GaugePool__factory, Erc20__factory } from '@/typechain/factories'

const useGauges = (): ActiveSupportedGauge[] => {
	const { account, library, chainId } = useWeb3React()

	const gauges = useMemo(() => {
		if (!library || !chainId) return []
		const signerOrProvider = account ? library.getSigner() : library
		return Config.gauges.map((gauge: any) => {
			const gaugeAddress = gauge.gaugeAddresses[chainId]
			const gaugeContract = Gauge__factory.connect(gaugeAddress, signerOrProvider)
			const poolAddress = gauge.poolAddresses[chainId]
			const poolContract = GaugePool__factory.connect(poolAddress, signerOrProvider)
			const lpAddress = gauge.lpAddresses[chainId]
			const lpContract = Erc20__factory.connect(lpAddress, signerOrProvider)
			return Object.assign(gauge, {
				gaugeAddress,
				poolAddress,
				lpAddress,
				gaugeContract,
				poolContract,
				lpContract,
			})
		})
	}, [library, account, chainId])

	return gauges
}

export default useGauges
