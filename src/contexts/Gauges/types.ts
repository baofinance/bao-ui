import { ActiveSupportedGauge } from '@/bao/lib/types'
import { BigNumber } from 'ethers'
import { Contract } from '@ethersproject/contracts'

export enum GaugeType {
	UNISWAP = 'uniswap',
	CURVE = 'curve',
	METAPOOL = 'metapool',
}
export interface Gauge {
	gid: number
	name: string
	symbol: string
	gaugeContract: Contract
	gaugeAddress: string
	poolContract: Contract
	poolAddress: string
	poolInfoContract: Contract
	poolInfoAddress: string
	lpToken: string
	lpAddress: string
	lpContract: Contract
	icon: string
	tvl: BigNumber
	apr: BigNumber
	weight: BigNumber
	type: GaugeType
}

export interface GaugesContext {
	gauges: ActiveSupportedGauge[]
}
