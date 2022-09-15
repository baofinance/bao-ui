import { Bao } from '@/bao/Bao'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import CreamABI from '@/bao/lib/abi/creamLending.json'
import ERC20ABI from '@/bao/lib/abi/erc20.json'

export const getContract = (library: Web3Provider, address: string) => {
	window.libary = library
	window.ethers = ethers
	window.ERC20ABI = ERC20ABI
	return library && new Contract(address, ERC20ABI, library)
}

export const getCreamContract = (library: Web3Provider, address: string) => {
	return library && new Contract(address, CreamABI, library)
}

export const getAllowance = async (contract: Contract, owner: string, spender: string): Promise<string> => {
	try {
		return (await contract.allowance(owner, spender)).toString()
	} catch (e) {
		return '0'
	}
}

export const getBalance = async (bao: Bao, tokenAddress: string, userAddress: string): Promise<string> => {
	const tokenContract = getContract(bao, tokenAddress)
	try {
		return (await tokenContract.balanceOf(userAddress)).toString()
	} catch (e) {
		return '0'
	}
}

export const getDecimals = async (bao: Bao, tokenAddress: string): Promise<string> => {
	const tokenContract = getContract(bao, tokenAddress)
	return (await tokenContract.decimals()).toString()
}
