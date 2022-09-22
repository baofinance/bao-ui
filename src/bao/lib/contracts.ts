import { Signer } from '@ethersproject/abstract-signer'
import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
//import { Contract } from '@ethersproject/contracts'
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

	constructor(signerOrProvider: Signer | Provider, networkId: number) {
		this.networkId = networkId

		this.contracts = Config.contracts
		Object.keys(Config.contracts).forEach(contractName => {
			this.contracts[contractName][networkId].contract = this.getNewContract(
				this.contracts[contractName][networkId].address,
				this.contracts[contractName][networkId].abi,
			)
		})

		this.gauges =
			networkId === Config.networkId
				? Config.gauges.map(gauge =>
						Object.assign(gauge, {
							gaugeAddress: gauge.gaugeAddresses[networkId],
							poolAddress: gauge.poolAddresses[networkId],
							lpAddress: gauge.lpAddresses[networkId],
							gaugeContract: this.getNewContract(gauge.gaugeAddresses[networkId], GaugeAbi),
							poolContract: this.getNewContract(gauge.poolAddresses[networkId], GaugePoolAbi),
							lpContract: this.getNewContract(gauge.lpAddresses[networkId], ERC20Abi),
						}),
				  )
				: undefined

		this.pools =
			networkId === Config.networkId
				? Config.farms.map(pool =>
						Object.assign(pool, {
							lpAddress: pool.lpAddresses[networkId],
							tokenAddress: pool.tokenAddresses[networkId],
							lpContract: this.getNewContract(pool.lpAddresses[networkId], UNIV2PairAbi),
							tokenContract: this.getNewContract(pool.tokenAddresses[networkId], ERC20Abi),
						}),
				  )
				: undefined

		// currently unused
		this.baskets =
			networkId === Config.networkId
				? Config.baskets.map(basket =>
						Object.assign(basket, {
							address: basket.basketAddresses[networkId],
							basketContract: this.getNewContract(basket.lpAddress, ExperipieAbi),
							ovenContract: this.getNewContract(basket.ovenAddress, 'oven.json'),
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
							marketContract: this.getNewContract(marketAddr, underlyingAddr === 'ETH' ? CEtherAbi : CTokenAbi),
							underlyingContract: underlyingAddr !== 'ETH' && this.getNewContract(underlyingAddr, ERC20Abi),
						})
				  })
				: undefined

		this.connectContracts(signerOrProvider, networkId)
	}

	connectContracts(providerOrSigner: Signer | Provider, networkId: number): void {
		const _connect = (contract: Contract) => {
			return contract.connect(providerOrSigner)
		}

		if (networkId === Config.networkId) {
			Object.keys(this.contracts).forEach(contractName => {
				this.contracts[contractName][networkId].contract = _connect(this.contracts[contractName][networkId].contract)
			})

			if (this.gauges) {
				Object.keys(this.gauges).forEach((k: any) => {
					this.gauges[k].gaugeContract = _connect(this.gauges[k].gaugeContract)
					this.gauges[k].poolContract = _connect(this.gauges[k].poolContract)
					this.gauges[k].lpContract = _connect(this.gauges[k].lpContract)
				})
			}

			if (this.pools) {
				Object.keys(this.pools).forEach((k: any) => {
					this.pools[k].lpContract = _connect(this.pools[k].lpContract)
					this.pools[k].tokenContract = _connect(this.pools[k].tokenContract)
				})
			}

			if (this.baskets) {
				Object.keys(this.baskets).forEach((k: any) => {
					this.baskets[k].basketContract = _connect(this.baskets[k].basketContract)
					this.baskets[k].ovenContract = _connect(this.baskets[k].ovenContract)
				})
			}

			if (this.markets) {
				Object.keys(this.markets).forEach((k: any) => {
					this.markets[k].marketContract = _connect(this.markets[k].marketContract)
					if (this.markets[k].underlyingContract) {
						this.markets[k].underlyingContract = _connect(this.markets[k].underlyingContract)
					}
				})
			}
		}
	}

	getContract(contractName: string, networkId = this.networkId): Contract {
		return this.contracts[contractName][networkId].contract
	}

	getNewContract(address: string, abi: string | any, provider?: Signer | Provider): Contract {
		const _abi = typeof abi === 'string' ? require(`./abi/${abi}`) : abi
		return new Contract(address, _abi, provider)
	}
}
