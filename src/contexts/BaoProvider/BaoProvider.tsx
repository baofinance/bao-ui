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
		bao: any
		ethereum?: any
	}
}

const BaoProvider: React.FC<PropsWithChildren<BaoProviderProps>> = ({ children }) => {
	const { library, account } = useWeb3React()
	const [bao, setBao] = useState<any>()

	// if (library) library.on('chainChanged', () => window.location.reload())

	useEffect(() => {
		if (!library || !account) { return }
		// const { ethereum: windowEth } = window
		// if (windowEth && !ethereum) {
		// 	// Check if user has connected to the webpage before
		// 	const mmWeb3 = new Web3Provider(windowEth)
		// 	mmWeb3.eth.getAccounts().then((accounts: string[]) => {
		// 		if (accounts.length > 0) activate('injected')
		// 	})
		// }

		// TODO: get the networkId from the provider
		const baoLib = new Bao(library, Config.networkId, {
			signer: account ? library.getSigner() : null,
		})
		setBao(baoLib)
		window.baosauce = baoLib
	}, [library, account])

	return <Context.Provider value={{ bao }}>{children}</Context.Provider>
}

export default BaoProvider
