import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Signer } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import Config from '@/bao/lib/config'
import { useQuery } from '@tanstack/react-query'

type ProviderKey = {
	provider: string
	signer: string
}
/*
 * Get a react-query query key for an ethers provider or signer.
 * */
const providerKey = (library?: Web3Provider, account?: string): ProviderKey | null => {
  if (library == null) return null
	const connection_url = library?.connection.url.substring(0, 25)
	return {
		provider: `${library?.network?.chainId}_${library?.network?.name}_${connection_url}`,
		signer: account || null,
	}
}

/*
 * Provides a connected `typechain` contract instance from the generated factories, looking
 * up its public key for from this project's config file.
 * @param contractName string The name of the typechain class for a smart contract.
 * @param address? string Manual override for the public key to connect the contract to.
 * @returns T | Contract | undefined
 * */
const useContract = <T = Contract>(contractName: string, address?: string): T => {
	const { library, account, chainId } = useWeb3React()
	const {
		data: contract,
		//refetch,
		//status,
	} = useQuery(
		['@/hooks/base/useContract', providerKey(library, account), { contractName, address, chainId }],
		async () => {
			let contractAddr
			try {
				contractAddr = address || Config.contracts[contractName][chainId].address
			} catch (e) {
				throw new Error(`No contract address given and cannot find ${contractName} in Config.contracts.`)
			}
			const factory = require(`@/typechain/factories`)[`${contractName}__factory`]
			const providerOrSigner = account ? library.getSigner() : library
			const _contract: T = factory.connect(contractAddr, providerOrSigner)
			return _contract
		},
		{
			enabled: !!library?.network && !!chainId,
			staleTime: Infinity,
			cacheTime: Infinity,
		},
	)

	return contract as T
}

export default useContract
