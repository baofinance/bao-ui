import { ActiveSupportedGauge } from '@/bao/lib/types'
import BigNumber from 'bignumber.js/bignumber'
import { Contract } from 'ethers'

export interface Gauge {
	gid: number
	name: string
	symbol: string
	lpToken: string
	lpAddress: string
	lpContract: Contract
	icon: string
	tvl: BigNumber
	apr: BigNumber
	weight: BigNumber
}

export interface GaugesContext {
	gauges: ActiveSupportedGauge[]
}
