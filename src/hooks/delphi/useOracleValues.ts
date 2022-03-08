import { useEffect, useState } from 'react'
import { Oracle, OracleValues } from '../../views/Delphi/types'
import Multicall from '../../utils/multicall'
import BigNumber from 'bignumber.js'
import useBao from '../base/useBao'

const useOracleValues = (oracles: Oracle[]) => {
  const [oraclePrices, setOraclePrices] = useState<OracleValues | undefined>()
  const bao = useBao()

  useEffect(() => {
    if (!bao) return

    const callContext = Multicall.createCallContext(
      oracles.map((cur) => {
        return {
          ref: cur.id,
          contract: bao.getNewContract('delphiOracle.json', cur.id),
          calls: [{ method: 'getLatestValue' }],
        }
      }),
    )

    bao.multicall.call(callContext).then((_res) => {
      const res = Multicall.parseCallResults(_res)
      const prices = Object.keys(res).reduce((prev, cur) => {
        if (res[cur][0].values.length === 0) return prev // If the value couldn't be fetched, ignore it.

        return {
          ...prev,
          [cur]: new BigNumber(res[cur][0].values[0].hex),
        }
      }, {})
      setOraclePrices(prices)
    })
  }, [bao, oracles])

  return oraclePrices
}

export default useOracleValues
