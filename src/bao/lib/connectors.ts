import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://rpc.flashbots.net'
}

export const injected = new InjectedConnector({ supportedChainIds: [1] })

export const network = new NetworkConnector({
  urls: { 1: 'https://mainnet.infura.io/v3/caf20378e5d149b88d43b9eacb902689' },
  defaultChainId: 1
})

export const walletConnect = new WalletConnectConnector({ rpc: { 1: 'https://rpc.flashbots.net' } })

export const coinbaseWallet = new WalletLinkConnector({ url: 'https://rpc.flashbots.net', appName: 'bao-ui', supportedChainIds: [1], })

