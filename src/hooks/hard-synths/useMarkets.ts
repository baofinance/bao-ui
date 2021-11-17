import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import useBao from '../useBao'
import Config from '../../bao/lib/config'
import { provider } from 'web3-core'
import { SupportedMarket } from '../../bao/lib/types'
import { decimate } from '../../utils/numberFormat'
import { Contract } from 'web3-eth-contract'

export const SECONDS_PER_BLOCK = 2
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: number) =>
  (Math.pow((rate / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100

const useMarkets = () => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const bao = useBao()
  const [markets, setMarkets] = useState<Market[] | undefined>()

  const fetchMarkets = useCallback(async () => {
    const contracts: Contract[] = Config.markets.map((market: SupportedMarket) => {
      return bao.getNewContract('ctoken.json', market.marketAddresses[Config.networkId])
    })
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
      collateralFactors,
      speeds, // UNUSED
      totalSupplies,
      exchangeRates,
      borrowState,
      oraclePrices, // UNUSED
    ]: any = await Promise.all([
      Promise.all(contracts.map((contract) => contract.methods.reserveFactorMantissa().call())),
      Promise.all(contracts.map((contract) => contract.methods.totalReserves().call())),
      Promise.all(contracts.map((contract) => contract.methods.totalBorrows().call())),
      Promise.all(contracts.map((contract) => contract.methods.supplyRatePerBlock().call())),
      Promise.all(contracts.map((contract) => contract.methods.borrowRatePerBlock().call())),
      Promise.all(contracts.map((contract) => contract.methods.getCash().call())),
      Promise.all(
        contracts.map((contract) => comptroller.methods.markets(contract.options.address).call())
      ),
      Promise.all(
        contracts.map((contract) => comptroller.methods.compSpeeds(contract.options.address).call())
      ), // UNUSED
      Promise.all(contracts.map((contract) => contract.methods.totalSupply().call())),
      Promise.all(
        contracts.map((contract) => contract.methods.exchangeRateCurrent().call())
      ),
      Promise.all(
        contracts.map((contract) =>
          comptroller.methods.compBorrowState(contract.options.address).call()
        )
      ),
      Promise.all(addresses.map((address: string) => oracle.methods.getUnderlyingPrice(address).call())), // UNUSED
    ])

    /*
    --UNUSED--
    const prices = oraclePrices
      .map((v: any) => decimate(v, new BigNumber(36).minus(18)) NOTE: Need to add config field for underlying asset's decimals. (UNDERLYING[addresses[i]].decimals)
      .reduce((p: any, v: any, i: number) => ({...p, [addresses[i]]:v}), {})
     */
    const supplyApys: number[] = supplyRates.map((rate: number) => toApy(rate))
    const borrowApys: number[] = borrowRates.map((rate: number) => toApy(rate))

    const markets: Market[] = contracts.map((contract, i) => {
      const underlying = Config.markets.find(
        (market) => market.marketAddresses[Config.networkId] === contract.options.address
      ).underlyingAddresses[Config.networkId] // contract.options.address !== ANCHOR_ETH ? UNDERLYING[address] : TOKENS.ETH
      return {
        token: contract.options.address,
        underlying,
        supplyApy: supplyApys[i],
        borrowApy: borrowApys[i],
        borrowable: borrowState[i][1] > 0,
        liquidity: decimate(cashes[i], 18 /* see note */).toNumber(), // NOTE - decimals from inverse UI: contracts[i].address === ANCHOR_WBTC ? 8 : 18
        totalReserves: decimate(totalReserves[i], 18 /* see note */).toNumber(), // NOTE - decimals from inverse UI: contracts[i].address === ANCHOR_WBTC ? 8 : 18
        totalBorrows: decimate(totalBorrows[i], 18 /* see note */).toNumber(), // NOTE - decimals from inverse UI: contracts[i].address === ANCHOR_WBTC ? 8 : 18
        collateralFactor: decimate(collateralFactors[i][1]).toNumber(),
        reserveFactor: decimate(reserveFactors[i]).toNumber(),
        supplied: decimate(exchangeRates[i]).times(decimate(totalSupplies[i], 18 /* see note */)).toNumber() // NOTE: Need to add config field for underlying asset's decimals. (totalSupplies[i])
      }
    })

    setMarkets(markets)
  }, [bao, account])

  useEffect(() => {
    if (!(bao && account)) return
    fetchMarkets()
  }, [bao, account])

  return markets
}

type Market = {
  token: string
  underlying: string
  supplyApy: number
  borrowApy: number
  borrowable: boolean
  liquidity: number
  totalReserves: number
  totalBorrows: number
  collateralFactor: number
  reserveFactor: number
  supplied: number
}

export default useMarkets
