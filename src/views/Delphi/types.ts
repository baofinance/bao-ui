import BigNumber from 'bignumber.js'

export type Variables = {
  [varLetter: string]: Aggregator
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
  id: string
  opcode: string
  child0: string
  child1: string
  child2: string
  child3: string
  value: string
}

export type Oracle = {
  id: string
  name: string
  aggregators: string[]
  creator: string
  equationNodes: EquationNode[]
}

export type OracleFactory = {
  id: string
  aggregators: string[]
  endorsed: string[]
  oracles: Oracle[]
}