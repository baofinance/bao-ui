import { TimeseriesData } from 'components/Graphs/AreaGraph/AreaGraph'
import { Basket } from 'contexts/Baskets'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import GraphClient from 'utils/graph'

const useGraphPriceHistory = (basket: Basket) => {
  const [res, setRes] = useState<TimeseriesData[] | undefined>()

  const querySubgraph = useCallback(async () => {
    if (!(basket && basket.basketTokenAddress)) return

    const data: any = await GraphClient.getPriceHistory(
      basket.basketTokenAddress.toLowerCase(),
    )

    // Workaround while nSTABLE has no price data, remove soon
    if (!data.tokens[0].dayData[1]) {
      setRes([
        {
          date: new Date().toString(),
          close: 1,
        },
        {
          date: new Date().toString(),
          close: 1,
        },
      ])
      return
    }

    const formattedData: Array<TimeseriesData> = data.tokens[0].dayData.map(
      (dayData: any) => ({
        date: new Date(dayData.date * 1000).toISOString(),
        close: parseFloat(dayData.priceUSD),
      }),
    )
    setRes(_.reverse(formattedData))
  }, [basket])

  useEffect(() => {
    querySubgraph()
  }, [basket])

  return res
}

export default useGraphPriceHistory
