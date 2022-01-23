import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import useBao from '../../../hooks/useBao'
import useTransactionProvider from '../../../hooks/useTransactionProvider'
import Config from '../../../bao/lib/config'
import { provider } from 'web3-core'
import { SupportedMarket } from '../../../bao/lib/types'
import { decimate } from '../../../utils/numberFormat'
import { Contract } from 'web3-eth-contract'

export const SECONDS_PER_BLOCK = 2
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: number) =>
  (Math.pow((rate / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100

export const useMarketsContext = (): SupportedMarket[] | undefined => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const bao = useBao()
  const { transactions } = useTransactionProvider()
  const [markets, setMarkets] = useState<SupportedMarket[] | undefined>()

  const fetchMarkets = useCallback(async () => {
    const contracts: Contract[] = Config.markets.map(
      (market: SupportedMarket) => {
        return bao.getNewContract(
          market.underlyingAddresses[Config.networkId] === 'ETH'
            ? 'cether.json'
            : 'ctoken.json',
          market.marketAddresses[Config.networkId],
        )
      },
    )
    const comptroller: Contract = bao.getContract('comptroller')
    const oracle: Contract = bao.getContract('marketOracle')

    const addresses: string[] = await comptroller.methods.getAllMarkets().call()
    const [
      reserveFactors,
      totalReserves,
      totalBorrows,
      supplyRates,
      borrowRates,
      cashes,
      marketsInfo,
      speeds, // UNUSED
      totalSupplies,
      exchangeRates,
      borrowState,
      oraclePrices, // UNUSED,
      underlyingSymbols,
      liquidationIncentive,
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
        contracts.map((contract) =>
          comptroller.methods.compSpeeds(contract.options.address).call(),
        ),
      ), // UNUSED
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
        addresses.map((address: string) =>
          oracle.methods.getUnderlyingPrice(address).call(),
        ),
      ), // UNUSED
      Promise.all(
        addresses.map((address: string) => {
          const underlyingAddress = Config.markets.find(
            (market) => market.marketAddresses[Config.networkId] === address,
          ).underlyingAddresses[Config.networkId]
          return underlyingAddress === 'ETH'
            ? underlyingAddress
            : bao
                .getNewContract('erc20.json', underlyingAddress)
                .methods.symbol()
                .call()
        }),
      ),
      comptroller.methods.liquidationIncentiveMantissa().call(),
    ])

    /*
    --UNUSED--
    const prices = oraclePrices
      .map((v: any) => decimate(v, new BigNumber(36).minus(18)) NOTE: Need to add config field for underlying asset's decimals. (UNDERLYING[addresses[i]].decimals)
      .reduce((p: any, v: any, i: number) => ({...p, [addresses[i]]:v}), {})
     */
    const supplyApys: number[] = supplyRates.map((rate: number) => toApy(rate))
    const borrowApys: number[] = borrowRates.map((rate: number) => toApy(rate))

    const markets: SupportedMarket[] = contracts.map((contract, i) => {
      const marketConfig = Config.markets.find(
        (market) =>
          market.marketAddresses[Config.networkId] === contract.options.address,
      ) // contract.options.address !== ANCHOR_ETH ? UNDERLYING[address] : TOKENS.ETH
      return {
        token: contract.options.address,
        underlying: marketConfig.underlyingAddresses[Config.networkId],
        underlyingSymbol: underlyingSymbols[i],
        supplyApy: supplyApys[i],
        borrowApy: borrowApys[i],
        borrowable: borrowState[i][1] > 0,
        liquidity: decimate(cashes[i], 18 /* see note */).toNumber(), // NOTE - decimals from inverse UI: contracts[i].address === ANCHOR_WBTC ? 8 : 18
        totalReserves: decimate(totalReserves[i], 18 /* see note */).toNumber(), // NOTE - decimals from inverse UI: contracts[i].address === ANCHOR_WBTC ? 8 : 18
        totalBorrows: decimate(totalBorrows[i], 18 /* see note */).toNumber(), // NOTE - decimals from inverse UI: contracts[i].address === ANCHOR_WBTC ? 8 : 18
        collateralFactor: decimate(marketsInfo[i][1]).toNumber(),
        imfFactor: decimate(marketsInfo[i][2]).toNumber(),
        reserveFactor: decimate(reserveFactors[i]).toNumber(),
        supplied: decimate(exchangeRates[i])
          .times(decimate(totalSupplies[i], marketConfig.decimals))
          .toNumber(),
        ...marketConfig,
        liquidationIncentive: decimate(liquidationIncentive)
          .minus(1)
          .times(100)
          .toNumber(),
      }
    })

    setMarkets(markets)
  }, [bao, account, transactions])

  useEffect(() => {
    if (!(bao && account)) return
    fetchMarkets()
  }, [bao, account, transactions])

  return markets
}
