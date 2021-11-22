import { useCallback, useEffect, useState } from 'react'
import useBao from '../useBao'
import { useWallet } from 'use-wallet'
import { useExchangeRates } from './useExchangeRates'
import { useBorrowBalances, useSupplyBalances } from './useBalances'
import useMarkets from './useMarkets'
import { useAnchorPrices } from './usePrices'
import { decimate } from '../../utils/numberFormat'
import { SupportedMarket } from '../../bao/lib/types'
import Config from '../../bao/lib/config'
import BigNumber from 'bignumber.js'

type AccountLiquidity = {
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
  const { prices: oraclePrices } = useAnchorPrices()

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
        const underlying = Config.markets.find(
          (market) =>
            market.marketAddresses[Config.networkId].toLowerCase() ===
            address.toLowerCase(),
        )
        return (
          prev +
          decimate(
            balance,
            underlying.decimals /* Might reference decimals of synth token */,
          ).toNumber() *
            decimate(exchangeRates[address]).toNumber() *
            prices[address]
        )
      },
      0,
    )

    const usdBorrow = Object.entries(borrowBalances).reduce(
      (prev: number, [, { address, balance }]) => {
        const underlying = Config.markets.find(
          (market) => market.marketAddresses[Config.networkId] === address,
        )
        return (
          prev +
          decimate(
            balance,
            underlying.decimals /* Might reference decimals of synth token */,
          ).toNumber() *
            prices[address]
        )
      },
      0,
    )

    const supplyApy = markets.reduce(
      (prev, { token, supplyApy, decimals }: SupportedMarket) =>
        prev +
        decimate(
          supplyBalances.find((balance) => balance.address === token).balance,
          decimals, // ? Might need underlying decimals here
        ).toNumber() *
          decimate(exchangeRates[token]).toNumber() *
          prices[token] *
          (supplyApy || 1),
      0,
    )

    const borrowApy = markets.reduce(
      (prev: number, { token, supplyApy, decimals }: SupportedMarket) =>
        prev +
        decimate(
          borrowBalances.find((balance) => balance.address === token).balance,
          decimals, // ? Might need underlying decimals here
        ).toNumber() *
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
