import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { NetworkConnector } from '@web3-react/network-connector'

let network: NetworkConnector | undefined

export const getNetworkConnector = (): NetworkConnector => {
	if (network) {
		return network
	}

	return (network = new NetworkConnector({
		urls: { 1: 'https://eth-mainnet.g.alchemy.com/v2/UZ88g_fys9oP-NhI2S-O47r6isdCIGHI' },
		defaultChainId: 1,
	}))
}

export const injected = new InjectedConnector({ supportedChainIds: [1] })

export const walletConnect = new WalletConnectConnector({
	rpc: { 1: 'https://eth-mainnet.g.alchemy.com/v2/UZ88g_fys9oP-NhI2S-O47r6isdCIGHI' },
})

export const coinbaseWallet = new WalletLinkConnector({
	url: 'https://eth-mainnet.g.alchemy.com/v2/UZ88g_fys9oP-NhI2S-O47r6isdCIGHI',
	appName: 'Bao',
	supportedChainIds: [1],
})
