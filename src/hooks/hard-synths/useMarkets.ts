import { useCallback, useContext, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import useBao from '../useBao'
import { SupportedMarket } from '../../bao/lib/types'
import { Context, MarketsContext } from '../../contexts/Markets'

export const useMarkets = (): SupportedMarket[] | undefined => {
  const { markets }: MarketsContext = useContext(Context)
  return markets
}

export const useAccountMarkets = (): SupportedMarket[] | undefined => {
  const bao = useBao()
  const markets = useMarkets()
  const { account }: { account: string } = useWallet()

  const [accountMarkets, setAccountMarkets] = useState<
    SupportedMarket[] | undefined
  >()

  const fetchAccountMarkets = useCallback(async () => {
    const comptroller = bao.getContract('comptroller')
    const _accountMarkets = await comptroller.methods
      .getAssetsIn(account)
      .call()

    setAccountMarkets(
      _accountMarkets.map((address: string) =>
        markets.find(({ token }) => token === address),
      ),
    )
  }, [bao, markets, account])

  useEffect(() => {
    if (!(bao && markets && account)) return

    fetchAccountMarkets()
  }, [bao, markets, account])

  return accountMarkets
}
