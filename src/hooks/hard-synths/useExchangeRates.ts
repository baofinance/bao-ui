import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useBao from '../useBao'
import useTransactionProvider from '../useTransactionProvider'
import { SupportedMarket } from '../../bao/lib/types'
import Config from '../../bao/lib/config'
import MultiCall from '../../utils/multicall'

type ExchangeRates = {
  exchangeRates: { [key: string]: BigNumber }
}

export const useExchangeRates = (): ExchangeRates => {
  const [exchangeRates, setExchangeRates] = useState<
    undefined | { [key: string]: BigNumber }
  >()
  const { transactions } = useTransactionProvider()
  const bao = useBao()

  const fetchExchangeRates = useCallback(async () => {
    const tokens = Config.markets.map(
      (market: SupportedMarket) => market.marketAddresses[Config.networkId],
    )
    const multiCallContext = MultiCall.createCallContext(
      tokens.map((token: string) => ({
        ref: token,
        contract: bao.getNewContract('ctoken.json', token),
        calls: [{ method: 'exchangeRateStored' }],
      })),
    )
    const data = MultiCall.parseCallResults(
      await bao.multicall.call(multiCallContext),
    )

    setExchangeRates(
      Object.keys(data).reduce(
        (exchangeRate: { [key: string]: BigNumber }, address: any) => ({
          ...exchangeRate,
          [address]: new BigNumber(data[address][0].values[0].hex),
        }),
        {},
      ),
    )
  }, [transactions, bao])

  useEffect(() => {
    if (!bao) return
    fetchExchangeRates()
  }, [transactions, bao])

  return {
    exchangeRates,
  }
}
