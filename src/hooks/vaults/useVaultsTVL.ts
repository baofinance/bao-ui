import { BigNumber } from 'ethers'
import { decimate } from '@/utils/numberFormat'
import { useVaults } from './useVaults'
import { useVaultPrices } from './usePrices'
import useContract from '@/hooks/base/useContract'
import type { Stabilizer } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useVaultsTVL = (vaultName: string) => {
	const { library, account, chainId } = useWeb3React()
	const vaults = useVaults(vaultName)
	const { prices } = useVaultPrices(vaultName) // TODO- use vault.price instead of vault prices hook
	const stabilizer = useContract<Stabilizer>('Stabilizer')

	const enabled = vaults?.length > 0 && !!stabilizer && !!prices
	const mids = vaults?.map(vault => vault.vid)
	const { data: tvl, refetch } = useQuery(
		['@/hooks/vaults/useVaultsTVL', providerKey(library, account, chainId), { enabled, prices, mids }],
		async () => {
			const vaultsTvl = vaults.reduce((prev, current) => {
				const _tvl = BigNumber.from(current.supplied).sub(current.totalBorrows).mul(prices[current.vaultAddress])
				return prev.add(decimate(_tvl, current.underlyingDecimals))
			}, BigNumber.from(0))

			// Assume $1 for DAI - need to use oracle price
			const ballastTvl = await stabilizer.supply()
			return vaultsTvl.add(decimate(ballastTvl))
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

	return tvl
}
