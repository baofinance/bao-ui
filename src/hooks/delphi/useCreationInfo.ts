import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useBao from '../base/useBao'
import { shuntingYard } from '../../utils/shuntingyard'
import { Variables } from '../../views/Delphi/types'

type CreationInfo = {
  gasEstimate: BigNumber
  txFee: BigNumber
  polish: number[]
  variables: Variables
}

const useCreationInfo = (equation: string, variables: Variables) => {
  const [creationInfo, setCreationInfo] = useState<CreationInfo | undefined>()
  const bao = useBao()

  const fetchCreationInfo = useCallback(async () => {
    const factory = bao.getContract('delphiFactory')
    const polish = shuntingYard(equation, variables)

    try {
      const gasPrice = await bao.web3.eth.getGasPrice()
      const gasEstimate = await factory.methods
        .createOracle(
          'placeholder', // Name does not matter w/ gas estimation
          Object.keys(variables)
            .filter((key) => variables[key].type === 'AGGREGATOR')
            .map((variable) => variables[variable].aggregator.id),
          polish.map((s: any) => parseFloat(s)),
        )
        .estimateGas({
          gasPrice,
        })
      setCreationInfo({
        gasEstimate: new BigNumber(gasEstimate),
        txFee: new BigNumber(gasPrice).times(gasEstimate),
        polish: polish.map((s: any) => parseFloat(s)),
        variables,
      })
    } catch (e) {
      setCreationInfo(undefined)
    }
  }, [bao, equation, variables])

  useEffect(() => {
    if (!(bao && equation && variables)) return

    fetchCreationInfo()
  }, [bao, equation, variables])

  return creationInfo
}

export default useCreationInfo
