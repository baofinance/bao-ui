import { Multicall as MC } from 'ethereum-multicall'
import { ethers } from 'ethers'
//import { provider } from 'web3-core/types'
import { Provider, JsonRpcProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import Config from './lib/config'
import { Contracts } from './lib/contracts'

export interface BaoOptions {
	ethereumNodeTimeout: number
}

export class Bao {
	public readonly networkId: number
	public readonly contracts: Contracts
	public readonly provider: Provider
	public readonly multicall: MC

	constructor(provider: string | Provider, networkId: number, options: BaoOptions) {
		let realProvider

		if (typeof provider === 'string') {
			realProvider = new ethers.providers.JsonRpcProvider(provider)
		} else if (provider) {
			realProvider = provider
		} else {
			realProvider = new ethers.providers.JsonRpcProvider(Config.defaultRpc.rpcUrls[0])
		}

		this.networkId = networkId
		this.provider = realProvider
		this.multicall = new MC({
			ethersProvider: this.provider,
			tryAggregate: true,
		})

		this.contracts = new Contracts(realProvider, networkId)
	}

	getContract(contractName: string, networkId = this.networkId): Contract {
		return this.contracts.getContract(contractName, networkId)
	}

	getNewContract(address: string, abi: string | unknown): Contract {
		return this.contracts.getNewContract(address, abi, this.provider)
	}

	async hasAccounts(): Promise<boolean> {
		return (await (this.provider as JsonRpcProvider).listAccounts()).length > 0
	}

	setProvider(provider: Provider, networkId: number): void {
		//this.web3.setProvider(provider)
		this.contracts.setProvider(provider, networkId)
	}
}
