import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useBao from '../useBao'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { decimate } from '../../utils/numberFormat'

export const useTVL = () => {
  const [tvl, setTvl] = useState<BigNumber | undefined>()
  const bao = useBao()
  const markets = useMarkets()
  const { prices } = useMarketPrices()

  const fetchTvl = useCallback(async () => {
    const marketsTvl = markets.reduce(
      (prev, current) =>
        prev.plus(
          decimate(
            (current.supplied - current.totalBorrows) * prices[current.token],
            36 - current.decimals,
          ),
        ),
      new BigNumber(0),
    )
    // Assume $1 for DAI - probs not the best move
    const ballastTvl = decimate(
      await bao.getContract('stabilizer').methods.supply().call(),
    )
    setTvl(marketsTvl.plus(ballastTvl))
  }, [markets, prices])

  useEffect(() => {
    if (!(markets && prices)) return

    fetchTvl()
  }, [markets, prices])

  return tvl
}
