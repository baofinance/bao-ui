import useGauges from '@/hooks/vebao/useGauges'
import React, { PropsWithChildren } from 'react'
import Context from './context'
//import { ActiveSupportedGauge } from '@/bao/lib/types'

interface GaugesProps {
	children: React.ReactNode
}

const Gauges: React.FC<PropsWithChildren<GaugesProps>> = ({ children }) => {
	const gauges = useGauges()

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
