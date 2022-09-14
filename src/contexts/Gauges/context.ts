import { createContext } from 'react'

import { GaugesContext } from './types'

const context = createContext<GaugesContext>({
	gauges: [],
})

export default context
