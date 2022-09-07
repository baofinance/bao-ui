import { getGauges } from '@/bao/utils'
import useBao from '@/hooks/base/useBao'
import React, { PropsWithChildren } from 'react'
import Context from './context'

interface GaugesProps {
	children: any
}

const Gauges: React.FC<PropsWithChildren<GaugesProps>> = ({ children }) => {
	const bao = useBao()

	const gauges = getGauges(bao)

	return (
		<Context.Provider
			value={{
				gauges,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export default Gauges
