import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useBao from '../base/useBao'
import { shuntingYard } from '../../utils/shuntingyard'
import { CreationInfo, EquationNode, Variables } from '../../views/Delphi/types'
import { setupNodes, solveMath } from '../../utils/equation'

const useCreationInfo = (equation: string, variables: Variables) => {
  const [creationInfo, setCreationInfo] = useState<CreationInfo | undefined>()
  const bao = useBao()
  BigNumber.config({ EXPONENTIAL_AT: 36 })

  const fetchCreationInfo = useCallback(async () => {
    const factory = bao.getContract('delphiFactory')
    const polish = shuntingYard(equation, variables)

    try {
      // Setup nodes as they would be in the contract
      const nodes: EquationNode[] = []
      setupNodes(nodes, polish)

      // Gas estimate
      const gasPrice = await bao.web3.eth.getGasPrice()
      const gasEstimate = await factory.methods
        .createOracle(
          'placeholder', // Name does not matter w/ gas estimation
          Object.keys(variables)
            .filter((key) => variables[key].type === 'AGGREGATOR')
            .map((variable) => variables[variable].aggregator.id),
          polish,
        )
        .estimateGas({
          gasPrice,
        })

      // Set creation information
      setCreationInfo({
        gasEstimate: new BigNumber(gasEstimate),
        txFee: new BigNumber(gasPrice).times(gasEstimate),
        polish,
        variables,
        output: solveMath(nodes, 0, variables),
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
