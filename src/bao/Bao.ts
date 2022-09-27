import { Multicall as MC } from 'ethereum-multicall'
import { ethers } from 'ethers'
import { Signer } from '@ethersproject/abstract-signer'
import { Provider, JsonRpcProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import Config from './lib/config'
import { Contracts } from './lib/contracts'

export interface BaoOptions {
	signer?: Signer
}

export class Bao {
	public readonly networkId: number
	public readonly contracts: Contracts
	public readonly provider: Provider
	public readonly multicall: MC

	constructor(provider: Provider, networkId: number, options: BaoOptions) {
		this.networkId = networkId
		this.provider = provider
		this.multicall = new MC({
			ethersProvider: this.provider,
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
