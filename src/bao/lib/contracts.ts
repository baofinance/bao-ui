import { ethers } from 'ethers'
import { Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import CEtherAbi from './abi/cether.json'
import CTokenAbi from './abi/ctoken.json'
import ERC20Abi from './abi/erc20.json'
import ExperipieAbi from './abi/experipie.json'
import GaugeAbi from './abi/gauge.json'
import GaugePoolAbi from './abi/gaugePool.json'
import UNIV2PairAbi from './abi/uni_v2_lp.json'
import Config from './config'
import * as Types from './types'

export class Contracts {
	[x: string]: any

	networkId: number
	provider: Provider
	contracts: Types.ContractsConfig
	pools: Types.FarmableSupportedPool[] | undefined
	baskets: Types.ActiveSupportedBasket[] | undefined
	markets: Types.ActiveSupportedMarket[] | undefined
	gauges: Types.ActiveSupportedGauge[] | undefined
	blockGasLimit: any
	notifier: any

	constructor(provider: Provider, networkId: number) {
		this.networkId = networkId
		this.provider = provider

		this.contracts = Config.contracts
		Object.keys(Config.contracts).forEach(contractName => {
			this.contracts[contractName][networkId].contract = this.getNewContract(
				this.contracts[contractName][networkId].address,
				this.contracts[contractName][networkId].abi,
				provider,
			)
		})

		this.gauges =
			networkId === Config.networkId
				? Config.gauges.map(gauge =>
						Object.assign(gauge, {
							gaugeAddress: gauge.gaugeAddresses[networkId],
							poolAddress: gauge.poolAddresses[networkId],
							lpAddress: gauge.lpAddresses[networkId],
							gaugeContract: this.getNewContract(gauge.gaugeAddresses[networkId], GaugeAbi, provider),
							poolContract: this.getNewContract(gauge.poolAddresses[networkId], GaugePoolAbi, provider),
							lpContract: this.getNewContract(gauge.lpAddresses[networkId], ERC20Abi, provider),
						}),
				  )
				: undefined

		this.pools =
			networkId === Config.networkId
				? Config.farms.map(pool =>
						Object.assign(pool, {
							lpAddress: pool.lpAddresses[networkId],
							tokenAddress: pool.tokenAddresses[networkId],
							lpContract: this.getNewContract(pool.lpAddresses[networkId], UNIV2PairAbi, provider),
							tokenContract: this.getNewContract(pool.tokenAddresses[networkId], ERC20Abi, provider),
						}),
				  )
				: undefined

		// currently unused
		this.baskets =
			networkId === Config.networkId
				? Config.baskets.map(basket =>
						Object.assign(basket, {
							address: basket.basketAddresses[networkId],
							basketContract: this.getNewContract(basket.lpAddress, ExperipieAbi, provider),
							ovenContract: this.getNewContract(basket.ovenAddress, 'oven.json', provider),
						}),
				  )
				: undefined

		this.markets =
			networkId === Config.networkId
				? Config.markets.map(market => {
						const marketAddr = market.marketAddresses[Config.networkId]
						const underlyingAddr = market.underlyingAddresses[Config.networkId]
						return Object.assign(market, {
							marketAddress: market.marketAddresses[networkId],
							underlyingAddress: market.underlyingAddresses[networkId],
							marketContract: this.getNewContract(marketAddr, underlyingAddr === 'ETH' ? CEtherAbi : CTokenAbi, provider),
							underlyingContract: underlyingAddr !== 'ETH' && this.getNewContract(underlyingAddr, ERC20Abi, provider),
						})
				  })
				: undefined

		this.setProvider(provider, networkId)
	}

	setProvider(provider: Provider, networkId: number): void {
		const setProvider = (contract: Contract, address: string) => {
			//if (address) contract.options.address = address
			//else console.error('Contract address not found in network', networkId)
		}

		if (networkId === Config.networkId) {
			Object.keys(this.contracts).forEach(contractName => {
				setProvider(this.contracts[contractName][networkId].contract, this.contracts[contractName][networkId].address)
			})

			if (this.gauges) {
				this.gauges.forEach(({ gaugeContract, gaugeAddress, poolContract, poolAddress, lpContract, lpAddress }) => {
					setProvider(gaugeContract, gaugeAddress)
					setProvider(poolContract, poolAddress)
					setProvider(lpContract, lpAddress)
				})
			}
			if (this.pools) {
				this.pools.forEach(({ lpContract, lpAddress, tokenContract, tokenAddress }) => {
					setProvider(lpContract, lpAddress)
					setProvider(tokenContract, tokenAddress)
				})
			}
			if (this.baskets) {
				this.baskets.forEach(({ address, basketContract, ovenAddress, ovenContract }) => {
					setProvider(basketContract, address)
					setProvider(ovenContract, ovenAddress)
				})
			}
			if (this.markets) {
				this.markets.forEach(({ marketContract, marketAddress, underlyingContract, underlyingAddress }) => {
					setProvider(marketContract, marketAddress)
					if (underlyingContract) setProvider(underlyingContract, underlyingAddress)
				})
			}
		}
	}

	getContract(contractName: string, networkId = this.networkId): Contract {
		return this.contracts[contractName][networkId].contract
	}

	getNewContract(address: string, abi: string | any, provider: Provider): Contract {
		const _abi = typeof abi === 'string' ? require(`./abi/${abi}`) : abi
		return new Contract(address, _abi, provider)
	}
}
