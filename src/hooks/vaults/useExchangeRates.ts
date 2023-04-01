import { BigNumber } from 'ethers'
import { ActiveSupportedVault } from '@/bao/lib/types'
import MultiCall from '@/utils/multicall'
import useBao from '../base/useBao'
import { useVaults } from '@/hooks/vaults/useVaults'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useEffect } from 'react'

type ExchangeRates = {
	exchangeRates: { [key: string]: BigNumber }
}

export const useExchangeRates = (vaultName: string): ExchangeRates => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const vaults = useVaults(vaultName)

	const enabled = vaults?.length > 0 && !!bao && !!account
	const mids = vaults?.map(vault => vault.vid)
	const { data: exchangeRates, refetch } = useQuery(
		['@/hooks/vaults/useExchangeRates', providerKey(library, account, chainId), { enabled, mids, vaultName }],
		async () => {
			const tokenContracts = vaults?.map((vault: ActiveSupportedVault) => vault.vaultContract)
			const multiCallContext = MultiCall.createCallContext(
				tokenContracts.map(tokenContract => ({
					ref: tokenContract.address,
					contract: tokenContract,
					calls: [{ method: 'exchangeRateStored' }],
				})),
			)
			const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))

			return Object.keys(data).reduce(
				(exchangeRate: { [key: string]: BigNumber }, address: string) => ({
					...exchangeRate,
					[address]: data[address][0].values[0],
				}),
				{},
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useEffect(() => {
		_refetch()
	}, [vaultName])

	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return {
		exchangeRates,
	}
}
