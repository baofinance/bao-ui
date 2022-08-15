import { createWeb3ReactRoot } from '@web3-react/core'
import { FC, PropsWithChildren } from 'react'

interface Web3ProviderNetworkProps {
	children: any
	getLibrary: any
}

const Web3ReactRoot = createWeb3ReactRoot('network')

export const Web3ProviderNetwork: FC<PropsWithChildren<Web3ProviderNetworkProps>> = ({ getLibrary, children }) => {
	return <Web3ReactRoot getLibrary={getLibrary}>{children}</Web3ReactRoot>
}

export default Web3ProviderNetwork
