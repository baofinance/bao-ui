import { ActiveSupportedVault } from '@/bao/lib/types'
import { Context, VaultsContext } from '@/contexts/Vaults'
import Config from '@/bao/lib/config'
import { useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'
import { Comptroller__factory } from '@/typechain/factories'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useVaults = (vaultName: string): ActiveSupportedVault[] | undefined => {
	const { vaults }: VaultsContext = useContext(Context)
	//if (vaultName === undefined || !vaults[vaultName]) return undefined
	return vaults[vaultName]
}

export const useAccountVaults = (vaultName: string): ActiveSupportedVault[] | undefined => {
	const vaults = useVaults(vaultName)
	const { library, account, chainId } = useWeb3React()

	const enabled = vaults?.length > 0 && !!library
	const mids = vaults?.map(vault => vault.mid)
	const { data: accountVaults, refetch } = useQuery(
		['@/hooks/vaults/useAccountVaults', providerKey(library, account, chainId), { enabled, mids, vaultName }],
		async () => {
			const comptroller = Comptroller__factory.connect(Config.vaults[vaultName].comptroller, library)
			const _accountVaults = await comptroller.getAssetsIn(account)
			return _accountVaults.map((address: string) => vaults.find(({ vaultAddress }) => vaultAddress === address))
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return accountVaults
}
