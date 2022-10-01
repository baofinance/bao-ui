import { useWeb3React } from '@web3-react/core'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'

import { Bao } from '@/bao/Bao'

export interface BaoContext {
	bao?: Bao
}

interface BaoProviderProps {
	children: React.ReactNode
}

export const Context = createContext<BaoContext>({
	bao: null,
})

declare global {
	interface Window {
		baosauce?: Bao
	}
}

const BaoProvider: React.FC<PropsWithChildren<BaoProviderProps>> = ({ children }) => {
	const { library, account, chainId } = useWeb3React()
	const [bao, setBao] = useState<Bao | null>(null)

	useEffect(() => {
		if (!library || !chainId) return
		const baoLib = new Bao(library, chainId, {
			signer: account ? library.getSigner() : null,
		})
		setBao(baoLib)
		window.baosauce = baoLib
	}, [library, chainId, account])

	return <Context.Provider value={{ bao }}>{children}</Context.Provider>
}

export default BaoProvider
