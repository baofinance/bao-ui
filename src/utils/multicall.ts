import { ContractCallContext, ContractCallResults } from 'ethereum-multicall'
import _ from 'lodash'
import { Contract } from '@ethersproject/contracts'

interface ContractCalls {
	contract: Contract
	ref: string
	calls: Array<ContractCall>
}

interface ContractCall {
	ref?: string
	method: string
	params?: Array<any>
}

const createCallContext = (contracts: ContractCalls[]): any[] =>
	_.map(contracts, (contract: ContractCalls) => {
		window.c = contract.contract
		window.i = contract.contract.interface
		window.f = contract.contract.interface.fragments
		console.log()
		return {
			reference: contract.ref,
			contractAddress: contract.contract.address,
			abi: contract.contract.interface.format(),
			calls: _.map(contract.calls, call => ({
				reference: call.ref,
				methodName: call.method,
				methodParameters: call.params || [],
			})),
		}
	})

const parseCallResults = (call: ContractCallResults): any => {
	const result: any = {}
	_.each(Object.keys(call.results), key => {
		result[key] = _.map(call.results[key].callsReturnContext, returnValue => ({
			method: returnValue.methodName,
			ref: returnValue.reference,
			values: returnValue.returnValues,
		}))
	})
	return result
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { createCallContext, parseCallResults }
