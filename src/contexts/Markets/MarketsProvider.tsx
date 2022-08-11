import React from 'react'
import { PropsWithChildren } from 'react'
import Context from './context'
import { useMarketsContext } from './context-hooks/useMarketsContext'

interface MarketsProviderProps {
	children: any
}
const MarketsProvider: React.FC<PropsWithChildren<MarketsProviderProps>> = ({ children }) => {
	const markets = useMarketsContext()

	return (
		<Context.Provider
			value={{
				markets,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export default MarketsProvider
