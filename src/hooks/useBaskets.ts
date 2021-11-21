import { Context as BasketsContext } from 'contexts/Baskets'
import { useContext } from 'react'

const useBaskets = () => {
  const { baskets } = useContext(BasketsContext)
  return [baskets]
}

export default useBaskets
