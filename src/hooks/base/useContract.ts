import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from '@ethersproject/contracts'
import Config from '@/bao/lib/config'

const useContract = <T = Contract>(contractName: string, address?: string): T => {
	const { library, account, chainId } = useWeb3React()

	const contract: T | null = useMemo(() => {
		if (!library || !chainId) return null
		if (address === null) return null
		const factory = require(`@/typechain/factories`)[`${contractName}__factory`]
		let contractAddr
		try {
			contractAddr = address || Config.contracts[contractName][chainId].address
		} catch (e) {
			throw new Error(`No contract address given and cannot find ${contractName} in Config.contracts.`)
		}
		const _contract: T = factory.connect(contractAddr, account ? library.getSigner() : library)
		return _contract
	}, [contractName, address, library, account, chainId])

	return contract
}

export default useContract
