import { Context as MarketsContext } from 'contexts/Markets'
import { useContext } from 'react'

const useMarkets = () => {
  const { markets } = useContext(MarketsContext)
  return [markets]
}

export default useMarkets
