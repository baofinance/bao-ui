import { useCallback, useEffect, useState } from 'react'
import useBao from '../useBao'
import { useWallet } from 'use-wallet'
import { useExchangeRates } from './useExchangeRates'
import { useBorrowBalances, useSupplyBalances } from './useBalances'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { decimate } from '../../utils/numberFormat'
import { SupportedMarket } from '../../bao/lib/types'
import Config from '../../bao/lib/config'
import BigNumber from 'bignumber.js'

export type AccountLiquidity = {
  netApy: number
  usdSupply: number
  usdBorrow: number
  usdBorrowable: number
}

export const useAccountLiquidity = (): AccountLiquidity => {
  const [accountLiquidity, setAccountLiquidity] = useState<
    undefined | AccountLiquidity
  >()

  const bao = useBao()
  const { account }: { account: string } = useWallet()
  const markets = useMarkets()
  const supplyBalances = useSupplyBalances()
  const borrowBalances = useBorrowBalances()
  const { exchangeRates } = useExchangeRates()
  const { prices: oraclePrices } = useMarketPrices()

  const fetchAccountLiquidity = useCallback(async () => {
    const compAccountLiqudity = await bao
      .getContract('comptroller')
      .methods.getAccountLiquidity(account)
      .call()

    const prices: { [key: string]: number } = {}
    for (const key in oraclePrices) {
      if (oraclePrices[key]) {
        prices[key] = decimate(
          oraclePrices[key],
          new BigNumber(36).minus(
            Config.markets.find(
              (market) => market.marketAddresses[Config.networkId] === key,
            ).decimals /* Might reference decimals of synth token */,
          ),
        ).toNumber()
      }
    }

    const usdSupply = Object.entries(supplyBalances).reduce(
      (prev: number, [, { address, balance }]) => {
        return (
          prev +
          balance *
            decimate(exchangeRates[address]).toNumber() *
            prices[address]
        )
      },
      0,
    )

    const usdBorrow = Object.entries(borrowBalances).reduce(
      (prev: number, [, { address, balance }]) =>
        prev + balance * prices[address],
      0,
    )

    const supplyApy = markets.reduce(
      (prev, { token, supplyApy }: SupportedMarket) =>
        prev +
        supplyBalances.find((balance) => balance.address === token).balance *
          decimate(exchangeRates[token]).toNumber() *
          prices[token] *
          (supplyApy || 1),
      0,
    )

    const borrowApy = markets.reduce(
      (prev: number, { token, supplyApy }: SupportedMarket) =>
        prev +
        borrowBalances.find((balance) => balance.address === token).balance *
          prices[token] *
          (supplyApy || 1),
      0,
    )

    const netApy =
      supplyApy > borrowApy
        ? (supplyApy - borrowApy) / usdSupply
        : borrowApy > supplyApy
        ? (supplyApy - borrowApy) / usdBorrow
        : 0

    setAccountLiquidity({
      netApy,
      usdSupply,
      usdBorrow,
      usdBorrowable: decimate(compAccountLiqudity[1]).toNumber(),
    })
  }, [
    bao,
    account,
    markets,
    supplyBalances,
    borrowBalances,
    exchangeRates,
    oraclePrices,
  ])

  useEffect(() => {
    if (
      !(
        bao &&
        account &&
        markets &&
        supplyBalances &&
        borrowBalances &&
        exchangeRates &&
        oraclePrices
      )
    )
      return
    fetchAccountLiquidity()
  }, [
    bao,
    account,
    markets,
    supplyBalances,
    borrowBalances,
    exchangeRates,
    oraclePrices,
  ])

  return accountLiquidity
}
