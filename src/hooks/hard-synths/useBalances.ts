import { useCallback, useEffect, useState } from 'react'
import useBao from '../useBao'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { provider } from 'web3-core'
import Config from '../../bao/lib/config'
import MultiCall from '../../utils/multicall'
import { decimate } from '../../utils/numberFormat'

export type Balance = {
  address: string
  symbol: string
  balance: number
}

export const useAccountBalances = (): Balance[] => {
  const bao = useBao()
  const { account }: { account: string; ethereum: provider } = useWallet()
  const tokens = Config.markets.map(
    (market) => market.underlyingAddresses[Config.networkId],
  )

  const [balances, setBalances] = useState<Balance[] | undefined>()

  const fetchBalances = useCallback(async () => {
    const data: Contract[] = tokens.map((address) =>
      bao.getNewContract('erc20.json', address),
    )

    const multicallResults = MultiCall.parseCallResults(
      await bao.multicall.call(
        MultiCall.createCallContext(
          data.map((contract) => ({
            ref: contract.options.address,
            contract,
            calls: [
              { method: 'symbol' },
              { method: 'decimals' },
              { method: 'balanceOf', params: [account] },
            ],
          })),
        ),
      ),
    )

    setBalances(
      Object.keys(multicallResults).map((address) => ({
        address,
        symbol: multicallResults[address][0].values[0],
        balance: decimate(
          multicallResults[address][2].values[0].hex,
          multicallResults[address][1].values[0],
        ).toNumber(),
      })),
    )
  }, [bao, account])

  useEffect(() => {
    if (!(bao && account)) return

    fetchBalances()
  }, [bao, account])

  return balances
}

export const useSupplyBalances = (): Balance[] => {
  const bao = useBao()
  const { account }: { account: string; ethereum: provider } = useWallet()
  const tokens = Config.markets.map(
    (market) => market.marketAddresses[Config.networkId],
  )

  const [balances, setBalances] = useState<Balance[] | undefined>()

  const fetchBalances = useCallback(async () => {
    const data: Contract[] = tokens.map((address) =>
      bao.getNewContract('ctoken.json', address),
    )

    const multicallResults = MultiCall.parseCallResults(
      await bao.multicall.call(
        MultiCall.createCallContext(
          data.map((contract) => ({
            ref: contract.options.address,
            contract,
            calls: [
              { method: 'symbol' },
              { method: 'balanceOf', params: [account] },
            ],
          })),
        ),
      ),
    )

    setBalances(
      Object.keys(multicallResults).map((address) => ({
        address,
        symbol: multicallResults[address][0].values[0],
        balance: decimate(
          multicallResults[address][1].values[0].hex,
          Config.markets.find(
            (market) => market.marketAddresses[Config.networkId] === address,
          ).decimals, // use underlying decimals
        ).toNumber(),
      })),
    )
  }, [bao, account])

  useEffect(() => {
    if (!(bao && account)) return

    fetchBalances()
  }, [bao, account])

  return balances
}

export const useBorrowBalances = (): Balance[] => {
  const bao = useBao()
  const { account }: { account: string; ethereum: provider } = useWallet()
  const tokens = Config.markets.map(
    (market) => market.marketAddresses[Config.networkId],
  )

  const [balances, setBalances] = useState<Balance[] | undefined>()

  const fetchBalances = useCallback(async () => {
    const data: Contract[] = tokens.map((address) =>
      bao.getNewContract('ctoken.json', address),
    )

    const multicallResults = MultiCall.parseCallResults(
      await bao.multicall.call(
        MultiCall.createCallContext(
          data.map((contract) => ({
            ref: contract.options.address,
            contract,
            calls: [
              { method: 'symbol' },
              { method: 'borrowBalanceStored', params: [account] },
            ],
          })),
        ),
      ),
    )

    setBalances(
      Object.keys(multicallResults).map((address) => ({
        address,
        symbol: multicallResults[address][0].values[0],
        balance: decimate(
          multicallResults[address][1].values[0].hex,
          Config.markets.find(
            (market) => market.marketAddresses[Config.networkId] === address,
          ).decimals, // use underlying decimals
        ).toNumber(),
      })),
    )
  }, [bao, account])

  useEffect(() => {
    if (!(bao && account)) return

    fetchBalances()
  }, [bao, account])

  return balances
}
