import { Contract } from 'web3-eth-contract'

export interface MarketComponent {
  address: string
  name: string
  symbol: string
  coingeckoId: string
  image: string
  decimals: number
}

export interface Market {
  icon?: string
  symbol?: string
  token: string
  underlying: string
  supplyApy: number
  borrowApy: number
  borrowable: boolean
  liquidity: number
  totalReserves: number
  totalBorrows: number
  collateralFactor: number
  reserveFactor: number
  supplied: number
}

export interface MarketsContext {
  markets: Market[]
}
