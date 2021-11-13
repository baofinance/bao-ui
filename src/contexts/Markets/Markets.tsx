import { getMarkets } from 'bao/utils'
import useBao from 'hooks/useBao'
import React, { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import Context from './context'

const Markets: React.FC = ({ children }) => {
	const bao = useBao()
	const { ethereum } = useWallet()

	const [markets, setMarkets] = useState(getMarkets(bao))
	useEffect(() => setMarkets(getMarkets(bao)), [ethereum, bao])

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

export default Markets
