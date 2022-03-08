// TS implementation of Equation.sol

import { EquationNode, Variables } from '../views/Delphi/types'
import BigNumber from 'bignumber.js'

const OPCODE_CONST = 0
const OPCODE_VAR = 1
const OPCODE_SQRT = 2
const OPCODE_NOT = 3
const OPCODE_ADD = 4
const OPCODE_SUB = 5
const OPCODE_MUL = 6
const OPCODE_DIV = 7
const OPCODE_EXP = 8
const OPCODE_PCT = 9
const OPCODE_EQ = 10
const OPCODE_NE = 11
const OPCODE_LT = 12
const OPCODE_GT = 13
const OPCODE_LE = 14
const OPCODE_GE = 15
const OPCODE_AND = 16
const OPCODE_OR = 17
const OPCODE_IF = 18
const OPCODE_BANCOR_LOG = 19
const OPCODE_BANCOR_POWER = 20
const OPCODE_INVALID = 21

export const setupNodes = (nodes: EquationNode[], polish: string[]) => {
  if (nodes.length === 0 && polish.length < 256) {
    for (let i = 0; i < polish.length; ++i) {
      const opcode = parseInt(polish[i])

      let node: EquationNode = {
        opcode: opcode.toString(),
      }

      if (opcode === OPCODE_CONST || opcode === OPCODE_VAR) {
        node.value = polish[++i]
      }
      nodes.push(node)
    }
    const lastNodeIndex = populateTree(nodes, 0)
    if (lastNodeIndex === nodes.length - 1) return
  }
}

const getChildrenCount = (opcode: number) => {
  if (opcode <= OPCODE_VAR) {
    return 0
  } else if (opcode <= OPCODE_NOT) {
    return 1
  } else if (opcode <= OPCODE_OR) {
    return 2
  } else if (opcode <= OPCODE_BANCOR_LOG) {
    return 3
  } else if (opcode <= OPCODE_BANCOR_POWER) {
    return 4
  }
  return -1
}

const populateTree = (nodes: EquationNode[], currentIndex: number) => {
  if (currentIndex < nodes.length) {
    const node: EquationNode = nodes[currentIndex]
    const opcode = node.opcode
    const childrenCount = getChildrenCount(parseInt(opcode))

    let lastIndex = currentIndex
    for (let i = 0; i < childrenCount; i++) {
      if (i === 0) node.child0 = (lastIndex + 1).toString()
      else if (i === 1) node.child1 = (lastIndex + 1).toString()
      else if (i === 2) node.child2 = (lastIndex + 1).toString()
      else if (i === 3) node.child3 = (lastIndex + 1).toString()
      lastIndex = populateTree(nodes, lastIndex + 1)
    }
    return lastIndex
  }
}

export const solveMath = (
  nodes: EquationNode[],
  index: number,
  variables: Variables,
): BigNumber => {
  const node: EquationNode = nodes[index]
  const opcode = parseInt(node.opcode)

  if (opcode === OPCODE_CONST) {
    return new BigNumber(node.value)
  } else if (opcode === OPCODE_VAR) {
    const a =
      variables[
        Object.keys(variables).filter(
          (i) => variables[i].type === 'AGGREGATOR',
        )[parseInt(node.value)]
      ].aggregator
    return a.latestAnswer.times(10 ** (18 - a.decimals))
  } else if (opcode === OPCODE_SQRT) {
    const childValue = solveMath(nodes, parseInt(node.child0), variables)
    let temp = new BigNumber(childValue).plus(1).div(2)
    let result = childValue
    while (temp < result) {
      result = temp
      temp = childValue.div(temp).plus(temp).div(2)
    }
  } else if (opcode >= OPCODE_ADD && opcode <= OPCODE_PCT) {
    const leftVal = solveMath(nodes, parseInt(node.child0), variables)
    const rightVal = solveMath(nodes, parseInt(node.child1), variables)
    if (opcode === OPCODE_ADD) {
      return leftVal.plus(rightVal)
    } else if (opcode === OPCODE_SUB) {
      return leftVal.minus(rightVal)
    } else if (opcode === OPCODE_MUL) {
      return leftVal.times(rightVal)
    } else if (opcode === OPCODE_DIV) {
      return leftVal.div(rightVal)
    } else if (opcode === OPCODE_EXP) {
      const power = rightVal.toNumber()
      let res = new BigNumber(1)
      for (let i = 0; i < power; ++i) {
        res = res.times(leftVal)
      }
      return res
    } else if (opcode === OPCODE_PCT) {
      return leftVal.times(rightVal).div(1e18)
    }
  }
  // TODO: Boolean logic!
}
