import { ActiveSupportedMarket } from '@/bao/lib/types'
import { Context, MarketsContext } from '@/contexts/Markets'
import { useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useMarkets = (): ActiveSupportedMarket[] | undefined => {
	const { markets }: MarketsContext = useContext(Context)
	return markets
}

export const useAccountMarkets = (): ActiveSupportedMarket[] | undefined => {
	const markets = useMarkets()
	const { library, account, chainId } = useWeb3React()
	const comptroller = useContract<Comptroller>('Comptroller')

	const enabled = !!library && !!comptroller && !!markets
	const { data: accountMarkets, refetch } = useQuery(
		['@/hooks/markets/useAccountMarkets', providerKey(library, account, chainId)],
		async () => {
			const _accountMarkets = await comptroller.getAssetsIn(account)
			return _accountMarkets.map((address: string) => markets.find(({ marketAddress }) => marketAddress === address))
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

	return accountMarkets
}
