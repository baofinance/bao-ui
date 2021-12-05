import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'
import useBao from '../useBao'
import { useWallet } from 'use-wallet'
import { useMarkets } from './useMarkets'
import useTransactionProvider from '../useTransactionProvider'
import MultiCall from '../../utils/multicall'

type Approvals = {
  approvals: { [key: string]: BigNumber }
}

export const useApprovals = (pendingTx: string | boolean): Approvals => {
  const { transactions } = useTransactionProvider()
  const bao = useBao()
  const { account } = useWallet()
  const markets = useMarkets()
  const [approvals, setApprovals] = useState<
    { [key: string]: BigNumber } | undefined
  >()

  const fetchApprovals = useCallback(async () => {
    const multicallContext = MultiCall.createCallContext(
      markets
        .map(
          (market) =>
            market.underlying !== 'ETH' && {
              ref: market.underlying,
              contract: bao.getNewContract('erc20.json', market.underlying),
              calls: [{ method: 'allowance', params: [account, market.token] }],
            },
        )
        .filter((call) => call),
    )
    const multicallResults = MultiCall.parseCallResults(
      await bao.multicall.call(multicallContext),
    )

    setApprovals(
      Object.keys(multicallResults).reduce(
        (approvals: { [key: string]: BigNumber }, address: any) => ({
          ...approvals,
          [address]: new BigNumber(multicallResults[address][0].values[0].hex),
        }),
        {},
      ),
    )
  }, [transactions, bao, account, markets, pendingTx])

  useEffect(() => {
    if (!(bao && account && markets)) return
    fetchApprovals()
  }, [transactions, bao, account, markets, pendingTx])

  return {
    approvals,
  }
}
