import { useWeb3React } from '@web3-react/core'
import { Bao } from 'bao'
import Config from 'bao/lib/config'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'

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
	const wallet = useWeb3React()
	const { library }: any = wallet
	const [bao, setBao] = useState<any>()

	// if (library) library.on('chainChanged', () => window.location.reload())

	window.bao = bao

	useEffect(() => {
		// const { ethereum: windowEth } = window
		// if (windowEth && !ethereum) {
		// 	// Check if user has connected to the webpage before
		// 	const mmWeb3 = new Web3Provider(windowEth)
		// 	mmWeb3.eth.getAccounts().then((accounts: string[]) => {
		// 		if (accounts.length > 0) activate('injected')
		// 	})
		// }

		const baoLib = new Bao(library, Config.networkId, {
			ethereumNodeTimeout: 10000,
		})
		setBao(baoLib)
		window.baosauce = baoLib
	}, [library])

	return <Context.Provider value={{ bao }}>{children}</Context.Provider>
}

export default BaoProvider
