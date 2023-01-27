import { Experipie, Oven, Erc20, Uni_v2_lp, Cether, Ctoken, Gauge, GaugePool, PoolInfo, CurveLp, CurveMetaPool } from '@/typechain/index'
import { BigNumber } from 'ethers'

export interface SupportedPool {
	pid: number
	lpAddresses: {
		[network: number]: string
	}
	tokenAddresses: {
		[network: number]: string
	}
	tokenDecimals: number
	name: string
	symbol: string
	poolType: string
	tokenSymbol: string
	iconA: string
	iconB: string
	refUrl: string
	pairUrl: string
	type: string
}

export interface SupportedGauge {
	gid: number
	name: string
	symbol: string
	type: string
	iconA: string
	iconB: string
	pairUrl: string
	gaugeAddresses: {
		[network: number]: string
	}
	poolAddresses: {
		[network: number]: string
	}
	lpAddresses: {
		[network: number]: string
	}
	poolInfoAddresses: {
		[network: number]: string
	}
}

export interface SupportedBasket {
	nid: number
	basketAddresses: {
		[network: number]: string
	}
	lpAddress: string
	symbol: string
	name: string
	icon: string
	cgIds: { [address: string]: string }
	pieColors: { [asset: string]: string }
	desc: string
	swap?: string
	address: string
	basketContract: Experipie
	ovenAddress: string
	ovenContract?: Oven
}

export interface SupportedMarket {
	mid: number
	archived?: boolean
	marketAddresses: {
		[network: number]: string
	}
	underlyingAddresses: {
		[network: number]: string
	}
	isSynth: boolean
	symbol: string
	icon: string
	coingeckoId: string
	underlyingDecimals: number
	underlyingSymbol?: string
	supplyApy?: BigNumber
	borrowApy?: BigNumber
	rewardApy?: BigNumber
	liquidity?: BigNumber
	collateralFactor?: BigNumber
	imfFactor?: BigNumber
	reserveFactor?: BigNumber
	totalBorrows?: BigNumber
	totalReserves?: BigNumber
	supplied?: BigNumber
	borrowable?: boolean
	liquidationIncentive?: BigNumber
	borrowRestricted?: boolean
	price?: BigNumber
}

export interface FarmableSupportedPool extends SupportedPool {
	lpAddress: string
	tokenAddress: string
	lpContract: Uni_v2_lp
	tokenContract: Erc20
}

export interface ActiveSupportedGauge extends SupportedGauge {
	gaugeAddress: string
	poolAddress: string
	lpAddress: string
	poolInfoAddress: string
	gaugeContract: Gauge
	poolContract: GaugePool
	lpContract: Uni_v2_lp | CurveLp | CurveMetaPool
	poolInfoContract: PoolInfo
}

export interface ActiveSupportedBasket extends SupportedBasket {
	address: string
	basketContract: Experipie
	ovenContract: Oven
}

export interface ActiveSupportedMarket extends SupportedMarket {
	marketAddress: string
	marketContract: Cether | Ctoken
	underlyingAddress: string
	underlyingContract?: Erc20
}

export interface RpcConfig {
	chainId: string
	rpcUrls: string[]
	blockExplorerUrls: string[]
	chainName: string
	nativeCurrency: {
		name: string
		symbol: string
		decimals: number
	}
}

export interface AddressMapConfig {
	[name: string]: string
}

export interface ContractsConfig {
	[name: string]: {
		[networkId: number]: {
			address: string
			abi: string
		}
	}
}

export interface SubgraphConfig {
	[subgraphName: string]: {
		[networkId: number]: string
	}
}

export interface Config {
	networkId: number
	defaultRpc: RpcConfig
	addressMap: AddressMapConfig
	contracts: ContractsConfig
	subgraphs: SubgraphConfig
	farms: SupportedPool[]
	baskets: SupportedBasket[]
	markets: {
		[marketName: string]: {
			comptroller: string
			oracle: string
			markets: SupportedMarket[]
		}
	}
	gauges: SupportedGauge[]
}

export type SWR = {
	isLoading?: boolean
	isError?: any
}
