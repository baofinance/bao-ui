import React from 'react'
import Context from './context'
import { useMarketsContext } from './context-hooks/useMarketsContext'

const MarketsProvider: React.FC = ({ children }) => {
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
