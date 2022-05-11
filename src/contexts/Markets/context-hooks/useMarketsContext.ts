import Config from 'bao/lib/config'
import { ActiveSupportedMarket } from 'bao/lib/types'
import useBao from 'hooks/base/useBao'
import useTransactionProvider from 'hooks/base/useTransactionProvider'
import { useCallback, useEffect, useState } from 'react'
import { decimate } from 'utils/numberFormat'
import { Contract } from 'web3-eth-contract'
import { useWeb3React } from '@web3-react/core'

export const SECONDS_PER_BLOCK = 2
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: number) =>
  (Math.pow((rate / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100

export const useMarketsContext = (): ActiveSupportedMarket[] | undefined => {
  const bao = useBao()
  const { library } = useWeb3React()
  const { transactions } = useTransactionProvider()
  const [markets, setMarkets] = useState<ActiveSupportedMarket[] | undefined>()

  const fetchMarkets = useCallback(async () => {
    const contracts: Contract[] = bao.contracts.markets.map(
      (market: ActiveSupportedMarket) => {
        return bao.getNewContract(
          market.underlyingAddress === 'ETH' ? 'cether.json' : 'ctoken.json',
          market.marketAddress,
        )
      },
    )
    const comptroller: Contract = bao.getContract('comptroller')
    const oracle: Contract = bao.getContract('marketOracle')

    const [
      reserveFactors,
      totalReserves,
      totalBorrows,
      supplyRates,
      borrowRates,
      cashes,
      marketsInfo,
      totalSupplies,
      exchangeRates,
      borrowState,
      symbols,
      underlyingSymbols,
      liquidationIncentive,
      borrowRestricted,
      prices,
    ]: any = await Promise.all([
      Promise.all(
        contracts.map((contract) =>
          contract.methods.reserveFactorMantissa().call(),
        ),
      ),
      Promise.all(
        contracts.map((contract) => contract.methods.totalReserves().call()),
      ),
      Promise.all(
        contracts.map((contract) => contract.methods.totalBorrows().call()),
      ),
      Promise.all(
        contracts.map((contract) =>
          contract.methods.supplyRatePerBlock().call(),
        ),
      ),
      Promise.all(
        contracts.map((contract) =>
          contract.methods.borrowRatePerBlock().call(),
        ),
      ),
      Promise.all(
        contracts.map((contract) => contract.methods.getCash().call()),
      ),
      Promise.all(
        contracts.map((contract) =>
          comptroller.methods.markets(contract.options.address).call(),
        ),
      ),
      Promise.all(
        contracts.map((contract) => contract.methods.totalSupply().call()),
      ),
      Promise.all(
        contracts.map((contract) =>
          contract.methods.exchangeRateCurrent().call(),
        ),
      ),
      Promise.all(
        contracts.map((contract) =>
          comptroller.methods.compBorrowState(contract.options.address).call(),
        ),
      ),
      Promise.all(
        bao.contracts.markets.map((market) => {
          return market.marketContract.methods.symbol().call()
        }),
      ),
      Promise.all(
        bao.contracts.markets.map((market) => {
          return market.underlyingContract
            ? market.underlyingContract.methods.symbol().call()
            : 'ETH'
        }),
      ),
      comptroller.methods.liquidationIncentiveMantissa().call(),
      Promise.all(
        contracts.map((market) =>
          comptroller.methods.borrowRestricted(market.options.address).call(),
        ),
      ),
      Promise.all(
        contracts.map((market) =>
          oracle.methods.getUnderlyingPrice(market.options.address).call(),
        ),
      ),
    ])

    const supplyApys: number[] = supplyRates.map((rate: number) => toApy(rate))
    const borrowApys: number[] = borrowRates.map((rate: number) => toApy(rate))

    let markets: ActiveSupportedMarket[] = contracts.map((contract, i) => {
      const marketConfig = bao.contracts.markets.find(
        (market) =>
          market.marketAddresses[Config.networkId] === contract.options.address,
      )
      return {
        symbol: symbols[i],
        underlyingSymbol: underlyingSymbols[i],
        supplyApy: supplyApys[i],
        borrowApy: borrowApys[i],
        borrowable: borrowState[i][1] > 0,
        liquidity: decimate(
          cashes[i],
          marketConfig.underlyingDecimals,
        ).toNumber(),
        totalReserves: decimate(totalReserves[i], 18 /* see note */).toNumber(),
        totalBorrows: decimate(totalBorrows[i], 18 /* see note */).toNumber(),
        collateralFactor: decimate(marketsInfo[i][1]).toNumber(),
        imfFactor: decimate(marketsInfo[i][2]).toNumber(),
        reserveFactor: decimate(reserveFactors[i]).toNumber(),
        liquidationIncentive: decimate(liquidationIncentive)
          .minus(1)
          .times(100)
          .toNumber(),
        borrowRestricted: borrowRestricted[i],
        supplied: decimate(exchangeRates[i])
          .times(decimate(totalSupplies[i], marketConfig.underlyingDecimals))
          .toNumber(),
        price: decimate(
          prices[i],
          36 - marketConfig.underlyingDecimals,
        ).toNumber(),
        ...marketConfig,
      }
    })
    markets = markets.filter((market: ActiveSupportedMarket) => !market.archived) // TODO- add in option to view archived markets

    setMarkets(markets)
  }, [bao, library, transactions])

  useEffect(() => {
    if (!(bao && library)) return
    fetchMarkets()
  }, [bao, library,  transactions])

  return markets
}

