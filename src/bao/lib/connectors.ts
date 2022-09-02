import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const supportedChainIds = [1]

// export const network = new NetworkConnector({
//   defaultChainId: 1,
//   urls: RPC,
// })

let network: NetworkConnector

const RPC_URLS: { [chainId: number]: string } = {
	1: 'https://eth-mainnet.g.alchemy.com/v2/UZ88g_fys9oP-NhI2S-O47r6isdCIGHI',
}

export const getNetworkConnector = (): NetworkConnector => {
	if (network) {
		return network
	}

	return (network = new NetworkConnector({
		defaultChainId: 1,
		urls: { 1: RPC_URLS[1] },
	}))
}

export const injected = new InjectedConnector({
	supportedChainIds,
})

export const walletConnect = new WalletConnectConnector({
	rpc: { 1: RPC_URLS[1] },
})

export const coinbaseWallet = new WalletLinkConnector({
	url: RPC_URLS[1],
	appName: 'bao-ui',
	supportedChainIds: [1],
})
