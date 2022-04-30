import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://eth.aragon.network/'
}

export const injected = new InjectedConnector({ supportedChainIds: [1] })

export const network = new NetworkConnector({
  urls: { 1: 'https://eth.aragon.network/' },
  defaultChainId: 1
})

export const walletConnect = new WalletConnectConnector({ rpc: { 1: 'https://eth.aragon.network/' } })

export const coinbaseWallet = new WalletLinkConnector({ url: 'https://eth.aragon.network/', appName: 'bao-ui', supportedChainIds: [1], })

