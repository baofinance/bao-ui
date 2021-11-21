import BigNumber from 'bignumber.js'
import { Basket } from 'contexts/Baskets'
import { useCallback, useEffect, useState } from 'react'
import GraphClient from 'utils/graph'
import { getWethPriceLink } from '../bao/utils'
import useBao from './useBao'

const usePairPrice = (basket: Basket) => {
  const [res, setRes] = useState<BigNumber | undefined>()
  const bao = useBao()

  const querySubgraph = useCallback(async () => {
    if (!(basket && basket.basketTokenAddress && bao)) return

    const wethPrice = await getWethPriceLink(bao)
    const pairPrice = await GraphClient.getPriceFromPair(
      wethPrice,
      basket.basketTokenAddress,
    )
    setRes(pairPrice)
  }, [bao, basket])

  useEffect(() => {
    querySubgraph()
  }, [bao, basket])

  return res
}

export default usePairPrice
