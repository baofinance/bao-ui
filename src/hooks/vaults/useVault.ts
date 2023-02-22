import { useContext } from 'react'

import { SupportedVault } from '@/bao/lib/types'
import { Context as VaultsContext } from '@/contexts/Vaults'

const useVault = (vaultName: string, id: string): SupportedVault => {
	const { vaults } = useContext(VaultsContext)
	return vaults[vaultName].vaults.find(vault => vault.underlyingSymbol === id)
}

export default useVault
