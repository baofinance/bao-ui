import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { getRecipeContract, getWethPriceContract } from '../bao/utils'
import MultiCall from '../utils/multicall'
import { decimate, exponentiate } from '../utils/numberFormat'
import useBao from './useBao'

const useBasketRate = (basketAddress: string) => {
  const bao = useBao()
  const recipeContract = getRecipeContract(bao)

  const [wethPerIndex, setWethPerIndex] = useState<BigNumber | undefined>()
  const [wethPrice, setWethPrice] = useState<BigNumber | undefined>()
  const [usdPerIndex, setUsdPerIndex] = useState<BigNumber | undefined>()

  const basketRate = useCallback(async () => {
    if (!(bao && basketAddress)) return

    const wethOracle = getWethPriceContract(bao)
    const multicallContext = MultiCall.createCallContext([
      {
        ref: 'recipeContract',
        contract: recipeContract,
        calls: [
          {
            method: 'calcToPie',
            params: [basketAddress, exponentiate(1).toString()],
          },
        ],
      },
      {
        ref: 'linkWethOracle',
        contract: wethOracle,
        calls: [{ method: 'decimals' }, { method: 'latestRoundData' }],
      },
    ])
    const { recipeContract: recipeResults, linkWethOracle: oracleResults } =
      await MultiCall.parseCallResults(
        await bao.multicall.call(multicallContext),
      )
    const wethPerBasket = decimate(recipeResults[0].values[0].hex)
    const _wethPrice = decimate(
      oracleResults[1].values[1].hex,
      oracleResults[0].values[0],
    )

    setWethPerIndex(wethPerBasket)
    setWethPrice(_wethPrice)
    setUsdPerIndex(_wethPrice.times(wethPerBasket))
  }, [bao, basketAddress])

  useEffect(() => {
    basketRate()
  }, [bao, basketAddress])

  return {
    wethPerIndex,
    wethPrice,
    usdPerIndex,
  }
}

export default useBasketRate
