const useAggregatorHistory = () => {

}

export default useAggregatorHistory

/*import { useCallback, useEffect, useState } from 'react'
import GraphUtil from '../../utils/graph'
import { TimeseriesData } from '../../components/Graphs/AreaGraph/AreaGraph'
import _ from "lodash";
import BigNumber from "bignumber.js";
import {decimate, exponentiate} from "../../utils/numberFormat";

type AggregatorHistory = {
  [proxy: string]: TimeseriesData[]
}

const useAggregatorHistory = (
  proxies: string[],
  show: boolean,
): AggregatorHistory => {
  const [history, setHistory] = useState<AggregatorHistory | undefined>()

  const fetchHistory = useCallback(async () => {
    const res = await GraphUtil.getAggregatorPriceHistory(proxies)

    console.log(res.reduce((prev: any, cur: any) => {
      let startDate = parseInt(cur.rounds[0].timestamp)
      const timeseries = cur.rounds.reduce((_prev: any, _cur: any) => {
        const ansStandardized = exponentiate(_cur.answer, 18 - cur.decimals)
        const _pushNewDay = () => {
          _prev.push({
            date: new Date(startDate * 1000),
            high: ansStandardized,
            low: ansStandardized,
            open: ansStandardized,
            close: ansStandardized,
          })
        }

        if (!_prev[0]) {
          _pushNewDay()
        }

        if (startDate + 86400 < parseInt(_cur.timestamp)) {
          startDate += 86400
          _pushNewDay()
        } else {
          if (ansStandardized.gt(_prev[_prev.length - 1].high)) _prev[_prev.length - 1].high = ansStandardized.toNumber()
          else if (ansStandardized.lt(_prev[_prev.length - 1])) _prev[_prev.length - 1].low = ansStandardized.toNumber()
          _prev[_prev.length - 1].close = ansStandardized.toNumber()
        }
        return _prev
      }, [])
      console.log(timeseries)

      return {
        ...prev,
        [cur.proxy]: {
          decimals: cur.decimals,
          description: cur.description,
          rounds: cur.rounds
        }
      }
    }, {}))
  }, [proxies, show])

  useEffect(() => {
    fetchHistory()
  }, [proxies, show])

  return history
}

export default useAggregatorHistory */