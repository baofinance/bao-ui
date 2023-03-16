import React from 'react'
import { PropsWithChildren } from 'react'

import Context from './context'
import { useVaultsContext } from './context-hooks/useVaultsContext'

interface VaultsProviderProps {
	children: any
}
const VaultsProvider: React.FC<PropsWithChildren<VaultsProviderProps>> = ({ children }) => {
	const vaults = useVaultsContext()

	return (
		<Context.Provider
			value={{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				vaults,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export default VaultsProvider
