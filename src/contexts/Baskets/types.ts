import BigNumber from 'bignumber.js'
import { Contract } from 'web3-eth-contract'

export enum IndexType {
  PORTFOLIO = 'portfolio',
  YIELD = 'yield',
  METAGOVERNANCE = 'metagovernance',
  baskets = 'test',
}

export interface BasketComponent {
  symbol: string
  address: string
  decimals: number
  color: string
  percentage: number
  imageUrl?: string
  balance?: BigNumber
  balanceDecimals?: number
  price?: BigNumber
  basePrice?: BigNumber
  baseBalance?: BigNumber
  strategy?: string
}

export interface Basket {
  nid: number
  id: string
  name: string
  basketContract: Contract
  basketToken: string
  basketTokenAddress: string
  inputToken: string
  inputTokenAddress: string
  icon: string
  indexType?: IndexType
  pieColors: any
}

export interface BasketsContext {
  baskets: Basket[]
}
