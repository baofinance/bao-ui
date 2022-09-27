import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'

const useContract = (contractName: string, address?: string) => {
	const { library, account, chainId } = useWeb3React()

	const contract = useMemo(() => {
		if (!library || !chainId) return null
		const factory = require(`@/typechain/factories`)[`${contractName}__factory`]
		let contractAddr
		try {
			contractAddr = address || Config.contracts[contractName][chainId].address
		} catch (e) {
			throw new Error(`No contract address given and cannot find ${contractName} in Config.contracts.`)
		}
		const signer = library.getSigner()
		return factory.connect(contractAddr, account ? signer : library)
	}, [contractName, address, library, account, chainId])

	return contract
}

export default useContract
