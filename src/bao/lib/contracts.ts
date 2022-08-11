import Web3 from 'web3'
import { provider } from 'web3-core/types'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import ERC20Abi from './abi/erc20.json'
import ExperipieAbi from './abi/experipie.json'
import UNIV2PairAbi from './abi/uni_v2_lp.json'
import CTokenAbi from './abi/ctoken.json'
import CEtherAbi from './abi/cether.json'
import Config from './config'
import * as Types from './types'

export class Contracts {
	[x: string]: any

	networkId: number
	web3: Web3
	contracts: Types.ContractsConfig
	pools: Types.FarmableSupportedPool[]
	baskets: Types.ActiveSupportedBasket[]
	markets: Types.ActiveSupportedMarket[]
	blockGasLimit: any
	notifier: any

	constructor(provider: string | provider, networkId: number, web3: Web3) {
		this.networkId = networkId
		this.web3 = web3

		this.contracts = Config.contracts
		Object.keys(Config.contracts).forEach(contractName => {
			this.contracts[contractName][networkId].contract = this.getNewContract(this.contracts[contractName][networkId].abi)
		})

		this.pools =
			networkId === Config.networkId
				? Config.farms.map(pool =>
						Object.assign(pool, {
							lpAddress: pool.lpAddresses[networkId],
							tokenAddress: pool.tokenAddresses[networkId],
							lpContract: this.getNewContract(UNIV2PairAbi),
							tokenContract: this.getNewContract(ERC20Abi),
						}),
				  )
				: undefined

		// currently unused
		this.baskets =
			networkId === Config.networkId
				? Config.baskets.map(basket =>
						Object.assign(basket, {
							address: basket.basketAddresses[networkId],
							basketContract: this.getNewContract(ExperipieAbi),
							ovenContract: this.getNewContract('oven.json'),
						}),
				  )
				: undefined

		this.markets =
			networkId === Config.networkId
				? Config.markets.map(market =>
						Object.assign(market, {
							marketAddress: market.marketAddresses[networkId],
							underlyingAddress: market.underlyingAddresses[networkId],
							marketContract: this.getNewContract(market.underlyingAddresses[Config.networkId] === 'ETH' ? CEtherAbi : CTokenAbi),
							underlyingContract: market.underlyingAddresses[Config.networkId] !== 'ETH' && this.getNewContract(ERC20Abi),
						}),
				  )
				: undefined

		this.setProvider(provider, networkId)
		this.setDefaultAccount(this.web3.eth.defaultAccount)
	}

	setProvider(provider: provider, networkId: number): void {
		const setProvider = (contract: Contract, address: string) => {
			if (address) contract.options.address = address
			else console.error('Contract address not found in network', networkId)
		}

		if (networkId === Config.networkId) {
			Object.keys(this.contracts).forEach(contractName => {
				setProvider(this.contracts[contractName][networkId].contract, this.contracts[contractName][networkId].address)
			})

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

	setDefaultAccount(account: string): void {
		Object.keys(this.contracts).forEach(contractName => (this.getContract(contractName).options.from = account))
	}

	getContract(contractName: string, networkId = this.networkId): Contract {
		return this.contracts[contractName][networkId].contract
	}

	getNewContract(abi: string | unknown, address?: string): Contract {
		return new this.web3.eth.Contract((typeof abi === 'string' ? require(`./abi/${abi}`) : abi) as AbiItem[], address)
	}
}
