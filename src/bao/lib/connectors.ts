import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { NetworkConnector } from '@web3-react/network-connector'

const RPC_URLS: { [chainId: number]: string } = {
	1: 'https://rpc.ankr.com/eth',
}

export const injected = new InjectedConnector({ supportedChainIds: [1] })

export const network = new NetworkConnector({
	urls: { 1: 'https://rpc.ankr.com/eth' },
	defaultChainId: 1,
})

export const walletConnect = new WalletConnectConnector({
	rpc: { 1: 'https://rpc.ankr.com/eth' },
})

export const coinbaseWallet = new WalletLinkConnector({
	url: 'https://rpc.ankr.com/eth',
	appName: 'bao-ui',
	supportedChainIds: [1],
})
