import { useEffect, useState } from 'react'
import Multicall from '../../utils/multicall'
import BigNumber from 'bignumber.js'
import useBao from '../base/useBao'
import { Aggregators, OracleFactory } from '../../views/Delphi/types'

const useAvailableAggregators = (factory: OracleFactory) => {
  const [aggregators, setAggregators] = useState<Aggregators | undefined>()
  const bao = useBao()

  useEffect(() => {
    if (!(bao && factory)) return

    const callContext = Multicall.createCallContext(
      factory.aggregators.map((aggregator) => ({
        ref: aggregator,
        contract: bao.getNewContract('chainoracle.json', aggregator),
        calls: [
          { method: 'decimals' },
          { method: 'description' },
          { method: 'latestAnswer' },
        ],
      })),
    )

    bao.multicall.call(callContext).then((_res) => {
      const res = Multicall.parseCallResults(_res)
      const _aggregators: Aggregators = Object.keys(res).reduce(
        (prev, key) => ({
          ...prev,
          [key]: {
            id: key,
            decimals: res[key][0].values[0],
            description: res[key][1].values[0],
            latestAnswer: new BigNumber(res[key][2].values[0].hex),
          },
        }),
        {},
      )
      setAggregators(_aggregators)
    })
  }, [bao, factory])

  return aggregators
}

export default useAvailableAggregators
