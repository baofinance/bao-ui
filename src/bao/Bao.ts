import { Multicall as MC } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { Signer } from '@ethersproject/abstract-signer'
import { Provider, JsonRpcProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import Config from './lib/config'
import { Contracts } from './lib/contracts'

export interface BaoOptions {
	ethereumNodeTimeout: number
	signer?: Signer
}

export class Bao {
	public readonly networkId: number
	public readonly contracts: Contracts
	public readonly provider: Provider
	public readonly multicall: MC

	constructor(provider: string | Provider, networkId: number, options: BaoOptions) {
		let realProvider

		if (typeof provider === 'string') {
			console.log('JsonRpcProvider', provider)
			realProvider = new ethers.providers.JsonRpcProvider(provider)
		} else if (provider) {
			console.log('some other provider', provider)
			realProvider = provider
		} else {
			console.log('JsonRpcProvider', Config.defaultRpc.rpcUrls[0])
			realProvider = new ethers.providers.JsonRpcProvider(Config.defaultRpc.rpcUrls[0])
		}

		this.networkId = networkId
		this.provider = realProvider
		this.multicall = new MC({
			ethersProvider: this.provider,
			tryAggregate: true,
		})

		const signerOrProvider = options.signer || this.provider
		this.contracts = new Contracts(signerOrProvider, this.networkId)
	}

	getContract(contractName: string, networkId = this.networkId): Contract {
		return this.contracts.getContract(contractName, networkId)
	}

	getNewContract(address: string, abi: string | unknown, providerOrSigner?: Provider | Signer): Contract {
		return this.contracts.getNewContract(address, abi, providerOrSigner || this.provider)
	}

	async hasAccounts(): Promise<boolean> {
		return (await (this.provider as JsonRpcProvider).listAccounts()).length > 0
	}

	setProvider(provider: Provider): void {
		this.contracts.connectContracts(provider, this.networkId)
	}

	setSigner(signer: Signer): void {
		this.contracts.connectContracts(signer, this.networkId)
	}
}
