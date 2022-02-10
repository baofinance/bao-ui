import { getFarms } from 'bao/utils'
import useBao from 'hooks/base/useBao'
import React from 'react'
import Context from './context'

const FarmsProvider: React.FC = ({ children }) => {
	const bao = useBao()
	const farms = getFarms(bao)

	return (
		<Context.Provider
			value={{
				farms,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export default FarmsProvider
