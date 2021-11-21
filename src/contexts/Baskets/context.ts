import { createContext } from 'react'
import { BasketsContext } from './types'

const context = createContext<BasketsContext>({
  baskets: [],
})

export default context
