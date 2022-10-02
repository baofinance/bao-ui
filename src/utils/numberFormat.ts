import BN from 'bignumber.js'
import { BigNumber } from 'ethers'
import type { BigNumberish } from '@ethersproject/bignumber'
// FIXME: this should all be using ethers.BigNumber

declare global {
	interface Window {
		BigNumber?: typeof BigNumber
	}
}

try {
	window.BigNumber = BigNumber
} catch (e) {
	void e
}

export const getDisplayBalance = (balance: BigNumberish | BN, decimals = 18, precision?: number): string => {
	const displayBalance = new BN(balance.toString()).div(new BN(10).pow(decimals))
	if (displayBalance.lt(1e-6)) return '0'
	else if (displayBalance.lt(1)) {
		return displayBalance.decimalPlaces(precision || 4).toFormat()
	} else {
		return displayBalance.decimalPlaces(precision || 2).toFormat()
	}
}

export const truncateNumber = (balance: BigNumberish | BN, decimals = 18) => {
	const displayBalance = new BN(balance.toString()).dividedBy(new BN(10).pow(decimals))
	if (displayBalance.isGreaterThanOrEqualTo(1000000000)) {
		return displayBalance.div(1000000000).toFixed(2).replace(/\.0$/, '') + 'B'
	}
	if (displayBalance.isGreaterThanOrEqualTo(1000000)) {
		return displayBalance.div(1000000).toFixed(2).replace(/\.0$/, '') + 'M'
	}
	if (displayBalance.isGreaterThanOrEqualTo(1000)) {
		return displayBalance.div(1000).toFixed(2).replace(/\.0$/, '') + 'K'
	}
	if (displayBalance.isGreaterThanOrEqualTo(0)) {
		return displayBalance.toFixed(2)
	}
	return displayBalance.toFixed()
}

export const getFullDisplayBalance = (balance: BigNumber | BN, decimals = 18): string => {
	return new BN(balance.toString()).dividedBy(new BN(10).pow(decimals)).toFixed()
}

export const decimate = (n: BigNumberish | BN, decimals = 18): BigNumber => {
	return BigNumber.from(n.toString()).div(BigNumber.from(10).pow(BigNumber.from(decimals)))
}

export const isBigNumberish = (val: any): boolean => {
	try {
		BigNumber.from(val)
		return true
	} catch (e) {
		return false
	}
}
