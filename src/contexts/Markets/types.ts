import { Contract } from 'web3-eth-contract'

export interface MarketComponent {
  address: string
  name: string
  symbol: string
  coingeckoId: string
  icon: string
  decimals: number
}

export interface Market {
  mid: number
  marketAddress: string
  marketContract: Contract
  underlyingAddress: string
  underlyingContract: Contract
  symbol: string
  icon: string
}

export interface MarketsContext {
  markets: Market[]
}
