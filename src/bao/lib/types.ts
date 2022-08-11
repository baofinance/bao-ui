import { Contract } from 'web3-eth-contract'

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

export interface SupportedBasket {
	nid: number
	basketAddresses?: {
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
	address?: string
	basketContract?: Contract
	ovenAddress: string
	ovenContract?: Contract
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
	supplyApy?: number
	borrowApy?: number
	rewardApy?: number
	liquidity?: number
	collateralFactor?: number
	imfFactor?: number
	reserveFactor?: number
	totalBorrows?: number
	totalReserves?: number
	supplied?: number
	borrowable?: boolean
	liquidationIncentive?: number
	borrowRestricted?: boolean
	price?: number
}

export interface FarmableSupportedPool extends SupportedPool {
	lpAddress: string
	tokenAddress: string
	lpContract: Contract
	tokenContract: Contract
}

export interface ActiveSupportedBasket extends SupportedBasket {
	address: string
	basketContract: Contract
	ovenContract: Contract
}

export interface ActiveSupportedMarket extends SupportedMarket {
	marketAddress: string
	marketContract: Contract
	underlyingAddress: string
	underlyingContract: Contract
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
			contract?: Contract
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
	markets: SupportedMarket[]
}

export type SWR = {
	isLoading?: boolean
	isError?: any
}
