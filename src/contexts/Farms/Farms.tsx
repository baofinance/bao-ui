import { getFarms } from 'bao/utils'
import useBao from 'hooks/base/useBao'
import React, { PropsWithChildren } from 'react'
import Context from './context'

interface FarmsProps {
	children: any
}

const Farms: React.FC<PropsWithChildren<FarmsProps>> = ({ children }) => {
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

export default Farms
