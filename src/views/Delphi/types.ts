import BigNumber from 'bignumber.js'

export type VariableType = 'AGGREGATOR' | 'CONSTANT'

export type Variables = {
  [varLetter: string]: {
    type: VariableType
    aggregator?: Aggregator
    value?: BigNumber
  }
}

export type Constants = {
  [varLetter: string]: BigNumber
}

export type Aggregator = {
  id: string
  description: string
  decimals: number
  latestAnswer: BigNumber
}

export type OracleValues = {
  [id: string]: BigNumber
}

export type EquationNode = {
  id?: string
  opcode: string
  child0?: string
  child1?: string
  child2?: string
  child3?: string
  value?: string
}

export type DayData = {
  id: string
  high: string
  low: string
  open: string
  close: string
  timestamp: string
}

export type Oracle = {
  id: string
  name: string
  aggregators: string[]
  creator: string
  equationNodes: EquationNode[]
  dayData: DayData[]
}

export type OracleFactory = {
  id: string
  aggregators: string[]
  endorsed: string[]
  oracles: Oracle[]
}

export type CreationInfo = {
  gasEstimate: BigNumber
  txFee: BigNumber
  polish: string[]
  variables: Variables
  output?: BigNumber
}