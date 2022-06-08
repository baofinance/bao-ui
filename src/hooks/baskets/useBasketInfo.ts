import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'
import useBao from '../base/useBao'
import { ActiveSupportedBasket } from '../../bao/lib/types'

type BasketInfo = {
  totalSupply: BigNumber
}

const useBasketInfo = (basket: ActiveSupportedBasket): BasketInfo => {
  const [info, setInfo] = useState<BasketInfo | undefined>()
  const bao = useBao()

  const fetchInfo = useCallback(async () => {
    const supply = await basket.basketContract.methods.totalSupply().call()

    setInfo({
      totalSupply: new BigNumber(supply),
    })
  }, [bao, basket])

  useEffect(() => {
    if (!(bao && basket)) return

    fetchInfo()
  }, [bao, basket])

  return info
}

export default useBasketInfo
