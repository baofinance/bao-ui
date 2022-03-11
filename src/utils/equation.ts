// TS implementation of Equation.sol

import { EquationNode, Oracle, Variables } from '../views/Delphi/types'
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
  } else if (opcode == OPCODE_IF) {
    const cond = solveBool(nodes, parseInt(node.child0), variables)
    if (cond) return solveMath(nodes, parseInt(node.child1), variables)
    else return solveMath(nodes, parseInt(node.child2), variables)
  }
  // TODO: Boolean logic!
}

const solveBool = (
  nodes: EquationNode[],
  index: number,
  variables: Variables,
): boolean => {
  const node: EquationNode = nodes[index]
  const opcode = parseInt(node.opcode)

  if (opcode === OPCODE_NOT) {
    return !solveBool(nodes, parseInt(node.child0), variables)
  } else if (opcode >= OPCODE_EQ && opcode <= OPCODE_GE) {
    const leftVal = solveMath(nodes, parseInt(node.child0), variables)
    const rightVal = solveMath(nodes, parseInt(node.child1), variables)

    if (opcode === OPCODE_EQ) {
      return leftVal.eq(rightVal)
    } else if (opcode === OPCODE_NE) {
      return !leftVal.eq(rightVal)
    } else if (opcode === OPCODE_LT) {
      return leftVal.lt(rightVal)
    } else if (opcode === OPCODE_GT) {
      return leftVal.gt(rightVal)
    } else if (opcode === OPCODE_LE) {
      return leftVal.lte(rightVal)
    } else if (opcode === OPCODE_GE) {
      return leftVal.gte(rightVal)
    }
  } else if (opcode >= OPCODE_AND && opcode <= OPCODE_OR) {
    const leftBoolVal = solveBool(nodes, parseInt(node.child0), variables)

    if (opcode === OPCODE_AND) {
      if (leftBoolVal) return solveBool(nodes, parseInt(node.child1), variables)
      else return false
    } else if (opcode === OPCODE_OR) {
      if (leftBoolVal) return true
      else return solveBool(nodes, parseInt(node.child1), variables)
    } else if (opcode === OPCODE_IF) {
      const cond = solveBool(nodes, parseInt(node.child0), variables)
      if (cond) return solveBool(nodes, parseInt(node.child1), variables)
      else return solveBool(nodes, parseInt(node.child2), variables)
    }
  }
}

// ---------------
// LaTeX Parser
// ---------------

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

const TEX_DICT: any = {
  '4': '+',
  '5': '-',
  '6': '\\times',
  '7': '\\div',
  '8': '^',
  '9': '\\times',
  '10': '==',
  '11': '!=',
  '12': '<',
  '13': '>',
  '14': '<=',
  '15': '>=',
  '16': '~and~',
  '17': '~or~',
  '18': '~?~',
}

export const nodesToTex = (
  oracle: Oracle,
  startingNode: EquationNode,
  variables: { [varLetter: string]: string } = {},
): { output: string; variables: { [varLetter: string]: string } } => {
  let output = ''

  if (startingNode && parseInt(startingNode.opcode) > OPCODE_SQRT) {
    output += '('
    output += nodesToTex(
      oracle,
      oracle.equationNodes[parseInt(startingNode.child0)],
      variables,
    ).output
    output += ` ${TEX_DICT[startingNode.opcode]} `

    // For exponents, we need to wrap the exponent in curly braces for latex to pick up multiple character exponents
    if (startingNode.opcode === OPCODE_EXP.toString()) output += '{'

    output += nodesToTex(
      oracle,
      oracle.equationNodes[parseInt(startingNode.child1)],
      variables,
    ).output

    // Handle our only 3-child opcode, ternary statements
    if (startingNode.opcode === OPCODE_IF.toString()) {
      output += ':'
      output += nodesToTex(
        oracle,
        oracle.equationNodes[parseInt(startingNode.child2)],
        variables,
      ).output
    }

    // The percent operator works as follows: x * y / 1e18.
    // Because the division isn't accounted for in the equation tree, we need to add it here
    if (startingNode.opcode === OPCODE_PCT.toString())
      output += `\\div ${new BigNumber(1e18).toString()}`
    // For exponents, we need to wrap the exponent in curly braces for latex to pick up multiple character exponents
    else if (startingNode.opcode === OPCODE_EXP.toString()) output += '}'

    output += ')'
  } else if (startingNode && parseInt(startingNode.opcode) === OPCODE_VAR) {
    let varLetter: string
    const oracleAddress = oracle.aggregators[parseInt(startingNode.value)]
    if (Object.values(variables).includes(oracleAddress)) {
      const keys = Object.keys(variables)
      varLetter = keys[Object.values(variables).indexOf(oracleAddress)]
    } else {
      varLetter = ALPHABET[Object.keys(variables).length]
      variables[varLetter] = oracle.aggregators[parseInt(startingNode.value)]
    }
    output += varLetter
  } else if (startingNode && parseInt(startingNode.opcode) === OPCODE_CONST) {
    output += startingNode.value
  }

  return {
    output,
    variables,
  }
}
