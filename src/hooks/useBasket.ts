import { Context } from 'contexts/Baskets'
import { useContext } from 'react'
import Config from '../bao/lib/config'

const useBasket: any = (id: string) => {
  const { baskets } = useContext(Context)
  const basket = Config.baskets.find((basket) => basket.nid.toString() === id)
  return (
    baskets.find((basket) => basket.nid.toString() === id) || {
      nid: basket.nid,
      basketToken: basket.symbol,
      basketTokenAddress: basket.basketAddresses[Config.networkId],
      inputToken: 'WETH',
      inputTokenAddress: Config.addressMap.WETH,
      name: basket.name,
      icon: '',
    }
  )
}

export default useBasket
