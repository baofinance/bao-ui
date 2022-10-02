import { ActiveSupportedMarket } from '@/bao/lib/types'
import { Context, MarketsContext } from '@/contexts/Markets'
import { useCallback, useContext, useEffect, useState } from 'react'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { useWeb3React } from '@web3-react/core'
import useContract from '@/hooks/base/useContract'
import type { Comptroller } from '@/typechain/index'

export const useMarkets = (): ActiveSupportedMarket[] | undefined => {
	const { markets }: MarketsContext = useContext(Context)
	return markets
}

export const useAccountMarkets = (): ActiveSupportedMarket[] | undefined => {
	const { transactions } = useTransactionProvider()
	const markets = useMarkets()
	const { account } = useWeb3React()
	const [accountMarkets, setAccountMarkets] = useState<ActiveSupportedMarket[] | undefined>()
	const comptroller = useContract<Comptroller>('Comptroller')

	const fetchAccountMarkets = useCallback(async () => {
		const _accountMarkets = await comptroller.getAssetsIn(account)
		setAccountMarkets(_accountMarkets.map((address: string) => markets.find(({ marketAddress }) => marketAddress === address)))
	}, [markets, account, comptroller])

	useEffect(() => {
		if (!(markets && account && comptroller)) return
		fetchAccountMarkets()
	}, [transactions, markets, account, fetchAccountMarkets, comptroller])

	return accountMarkets
}
