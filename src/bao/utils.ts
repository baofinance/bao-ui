import Multicall from '@/utils/multicall'
import { BigNumber } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { Bao } from './Bao'
import type { Chainoracle } from '@/typechain/index'

export const getPoolWeight = async (masterChefContract: Contract, pid: number): Promise<BigNumber> => {
	const [{ allocPoint }, totalAllocPoint] = await Promise.all([masterChefContract.poolInfo(pid), masterChefContract.totalAllocPoint()])

	return allocPoint.div(totalAllocPoint)
}

export const getTotalLPWethValue = async (
	masterChefContract: Contract,
	wethContract: Contract,
	lpContract: Contract,
	tokenContract: Contract,
	tokenDecimals: number,
	pid: number,
): Promise<{
	tokenAmount: BigNumber
	wethAmount: BigNumber
	totalWethValue: BigNumber
	tokenPriceInWeth: BigNumber
	poolWeight: BigNumber
}> => {
	const [tokenAmountWholeLP, balance, totalSupply, lpContractWeth, poolWeight] = await Promise.all([
		tokenContract.balanceOf(lpContract.address),
		lpContract.balanceOf(masterChefContract.address),
		lpContract.totalSupply(),
		wethContract.balanceOf(lpContract.address),
		getPoolWeight(masterChefContract, pid),
	])

	// Return p1 * w1 * 2
	const portionLp = balance.div(totalSupply)
	const lpWethWorth = lpContractWeth
	const totalLpWethValue = portionLp.mul(lpWethWorth).mul(BigNumber.from(2))
	// Calculate
	const tokenAmount = tokenAmountWholeLP.mul(portionLp).div(BigNumber.from(10).pow(tokenDecimals))

	const wethAmount = lpContractWeth.mul(portionLp).div(BigNumber.from(10).pow(18))
	return {
		tokenAmount,
		wethAmount,
		totalWethValue: totalLpWethValue.div(BigNumber.from(10).pow(18)),
		tokenPriceInWeth: wethAmount.div(tokenAmount),
		poolWeight: poolWeight,
	}
}

export const getOraclePrice = async (bao: Bao, priceOracle: Chainoracle): Promise<BigNumber> => {
	const { price } = Multicall.parseCallResults(
		await bao.multicall.call(
			Multicall.createCallContext([
				{
					ref: 'price',
					contract: priceOracle,
					calls: [{ method: 'decimals' }, { method: 'latestRoundData' }],
				},
			]),
		),
	)

	return price[1].values[1].mul(BigNumber.from(10).pow(price[0].values[0]))
}
