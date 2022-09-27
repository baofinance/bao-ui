import { useWeb3React } from '@web3-react/core'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'

import { Bao } from '@/bao/Bao'
import Config from '@/bao/lib/config'

export interface BaoContext {
	bao?: typeof Bao
}

interface BaoProviderProps {
	children: any
}

export const Context = createContext<BaoContext>({
	bao: undefined,
})

declare global {
	interface Window {
		baosauce: any
		ethereum?: any
	}
}

const BaoProvider: React.FC<PropsWithChildren<BaoProviderProps>> = ({ children }) => {
	const { library, account, chainId } = useWeb3React()
	const [bao, setBao] = useState<any>()

	useEffect(() => {
		if (!library || !chainId) {
			return
		}
		const baoLib = new Bao(library, chainId, {
			signer: account ? library.getSigner() : null,
		})
		setBao(baoLib)
		window.baosauce = baoLib
	}, [library, chainId, account])

	return <Context.Provider value={{ bao }}>{children}</Context.Provider>
}

export default BaoProvider
