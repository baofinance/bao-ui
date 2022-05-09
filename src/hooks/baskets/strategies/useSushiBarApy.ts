import sushiData from '@sushiswap/sushi-data'
import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'

// xSUSHI APY must be fetched from the sushi subgraph
const useSushiBarApy = () => {
  const [apy, setApy] = useState<BigNumber | undefined>()

  const fetchApy = useCallback(async () => {
    setApy(await fetchSushiApy())
  }, [])

  useEffect(() => {
    fetchApy()
  }, [])

  return apy
}

export const fetchSushiApy = async (): Promise<BigNumber> => {
  const info = await sushiData.bar.info()
  const dayData = await sushiData.exchange.dayData({
    minTimestamp: parseInt(
      (new Date(new Date().getTime() - 86400000).getTime() / 1000).toFixed(0),
    ),
  })
  const derivedETH = await sushiData.sushi.priceETH()

  return new BigNumber(dayData[0].volumeETH)
    .times(0.05)
    .times(0.01)
    .div(info.totalSupply)
    .times(365)
    .div(new BigNumber(info.ratio).times(derivedETH))
    .times(1e18)
}

export default useSushiBarApy
