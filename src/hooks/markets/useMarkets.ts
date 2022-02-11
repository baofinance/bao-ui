import { ActiveSupportedMarket } from 'bao/lib/types'
import { Context, MarketsContext } from 'contexts/Markets'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'

export const useMarkets = (): ActiveSupportedMarket[] | undefined => {
  const { markets }: MarketsContext = useContext(Context)
  return markets
}

export const useAccountMarkets = (): ActiveSupportedMarket[] | undefined => {
  const { transactions } = useTransactionProvider()
  const bao = useBao()
  const markets = useMarkets()
  const { account }: { account: string } = useWallet()

  const [accountMarkets, setAccountMarkets] = useState<
    ActiveSupportedMarket[] | undefined
  >()

  const fetchAccountMarkets = useCallback(async () => {
    const comptroller = bao.getContract('comptroller')
    const _accountMarkets = await comptroller.methods
      .getAssetsIn(account)
      .call()

    setAccountMarkets(
      _accountMarkets.map((address: string) =>
        markets.find(({ marketAddress }) => marketAddress === address),
      ),
    )
  }, [transactions, bao, markets, account])

  useEffect(() => {
    if (!(bao && markets && account)) return

    fetchAccountMarkets()
  }, [transactions, bao, markets, account])

  return accountMarkets
}
