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
		if (!bao) {
			const baoLib = new Bao(library, Config.networkId, {
				ethereumNodeTimeout: 10000,
				signer: account ? library.getSigner() : null,
			})
			setBao(baoLib)
			window.baosauce = baoLib
		} else {
			console.log('setting UP baolib')
			if (account) {
				console.log('with signer')
				bao.contracts.connectContracts(library.getSigner())
			} else {
				console.log('withOUT signer')
				bao.contracts.connectContracts(library)
			}
		}
	}, [library, account, bao])

   useEffect(() => {
		if (!bao && (!library || !account)) { return }
	}, [bao, library, account])
	return <Context.Provider value={{ bao }}>{children}</Context.Provider>
}

export default BaoProvider
