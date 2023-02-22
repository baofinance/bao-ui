import { ActiveSupportedVault } from '@/bao/lib/types'
import Config from '@/bao/lib/config'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { Comptroller__factory, MarketOracle__factory, Stabilizer__factory } from '@/typechain/factories'

const useVaults = (): ActiveSupportedVault[] => {
	const { account, library, chainId } = useWeb3React()

	const vaults = useMemo(() => {
		if (!library || !chainId) return []
		const signerOrProvider = account ? library.getSigner() : library
		return Config.markets[marketName].map((vault: any) => {
			const comptrollerAddress = vault.comptrollerAddresses[chainId]
			const comptrollerContract = Comptroller__factory.connect(comptrollerAddress, signerOrProvider)
			const marketOracleAddress = vault.oracleAddresses[chainId]
			const marketOracleContract = MarketOracle__factory.connect(marketOracleAddress, signerOrProvider)
			const ballastAddress = vault.ballastAddresses[chainId]
			const ballastContract = Stabilizer__factory.connect(ballastAddress, signerOrProvider)
			return Object.assign(vault, {
				comptrollerAddress,
				marketOracleAddress,
				ballastAddress,
				comptrollerContract,
				marketOracleContract,
				ballastContract,
			})
		})
	}, [library, account, chainId])

	return vaults
}

export default useVaults
