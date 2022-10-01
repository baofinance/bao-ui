import BN from 'bignumber.js'
import { BigNumber } from 'ethers'
import type { BigNumberish } from '@ethersproject/bignumber'
// FIXME: this should all be using ethers.BigNumber

export const getDisplayBalance = (balance: BigNumberish | BN, decimals = 18, precision?: number): string => {
	const displayBalance = new BN(balance.toString()).div(new BN(10).pow(decimals))
	if (displayBalance.lt(1e-6)) return '0'
	else if (displayBalance.lt(1)) {
		return displayBalance.toPrecision(precision || 4)
	} else {
		const dbNew = precision === 0 ? displayBalance.decimalPlaces(0).toString() : displayBalance.toFixed(precision || 2)
		return dbNew.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	}
}

export const truncateNumber = (balance: BigNumberish | BN, decimals = 18) => {
	const displayBalance = new BN(balance.toString()).dividedBy(new BN(10).pow(decimals))
	const analytic = displayBalance.toNumber()

	if (displayBalance.isGreaterThanOrEqualTo(1000000000)) {
		return (analytic / 1000000000).toFixed(2).replace(/\.0$/, '') + 'B'
	}
	if (displayBalance.isGreaterThanOrEqualTo(1000000)) {
		return (analytic / 1000000).toFixed(2).replace(/\.0$/, '') + 'M'
	}
	if (displayBalance.isGreaterThanOrEqualTo(1000)) {
		return (analytic / 1000).toFixed(2).replace(/\.0$/, '') + 'K'
	}
	if (displayBalance.isGreaterThanOrEqualTo(0)) {
		return analytic.toFixed(2)
	}
	return analytic
}

export const getFullDisplayBalance = (balance: BigNumber | BN, decimals = 18) => {
	return new BN(balance.toString()).dividedBy(new BN(10).pow(decimals)).toFixed()
}

//export const decimate = (n: any, decimals?: any): BigNumber => {
export const decimate = (n: BigNumberish | BN, decimals = 18): BigNumber => {
	//return new BigNumber(n).div(new BigNumber(10).pow(new BigNumber(decimals || 18)))
	const num = BigNumber.from(n.toString())
	const den = BigNumber.from(10).pow(BigNumber.from(decimals))
	const o = num.div(den)
	return o
}

// FIXME: make this return an ethers.BigNumber
export const exponentiate = (n: BigNumberish | BN, decimals = 18): BN => {
	return new BN(n.toString()).times(new BN(10).pow(new BN(decimals)))
}

export const isBigNumberish = (val: any): boolean => {
	try {
		BigNumber.from(val)
		return true
	} catch (e) {
		return false
	}
}
