import { getBaskets } from 'bao/utils'
import useBao from 'hooks/useBao'
import React, { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import Context from './context'

const Baskets: React.FC = ({ children }) => {
	const bao = useBao()
	const { ethereum } = useWallet()

	const [baskets, setBaskets] = useState(getBaskets(bao))
	useEffect(() => setBaskets(getBaskets(bao)), [ethereum, bao])

	return (
		<Context.Provider
			value={{
				baskets,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export default Baskets
