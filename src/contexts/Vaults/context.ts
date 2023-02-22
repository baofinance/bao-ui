import { createContext } from 'react'

import { VaultsContext } from './types'

const context = createContext<VaultsContext>({
	vaults: [],
})

export default context
