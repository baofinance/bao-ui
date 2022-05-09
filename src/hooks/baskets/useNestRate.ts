import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import useBao from '../base/useBao'
import { getWethPriceLink } from '../../bao/utils'

type BasketRates = {
  eth: BigNumber
  usd: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
  const [rates, setRates] = useState<BasketRates | undefined>()
  const bao = useBao()

  const fetchRates = useCallback(async () => {
    const recipe = bao.getContract('recipe')
    const wethPrice = await getWethPriceLink(bao)

    const basketPrice = await recipe.methods
      .getPricePie(basket.address, new BigNumber(1e18))
      .call()

    setRates({
      eth: new BigNumber(basketPrice[0]),
      usd: wethPrice.times(basketPrice[0]),
    })
  }, [bao, basket])

  useEffect(() => {
    if (!(bao && basket)) return

    fetchRates()
  }, [bao, basket])

  return rates
}

export default useBasketRates
