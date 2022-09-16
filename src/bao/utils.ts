import Multicall from '@/utils/multicall'
import { decimate, exponentiate } from '@/utils/numberFormat'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import _ from 'lodash'
import { Contract } from '@ethersproject/contracts'
import { Bao } from './Bao'
import { ActiveSupportedBasket, ActiveSupportedGauge, ActiveSupportedMarket, FarmableSupportedPool } from './lib/types'

BigNumber.config({
	EXPONENTIAL_AT: 1000,
	DECIMAL_PLACES: 80,
})

export const getWethContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('weth')
}

export const getWethPriceContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('wethPrice')
}

export const getComptrollerContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('comptroller')
}

export const getMasterChefContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('masterChef')
}

export const getGaugeControllerContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('gaugeController')
}

export const getVotingEscrowContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('votingEscrow')
}

export const getMinterContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('minter')
}

export const getBaoContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('bao')
}

export const getCrvContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('crv')
}

export const getBasketContract = (bao: Bao, nid: number): Contract | undefined => {
	if (bao && bao.contracts && bao.contracts.baskets) return _.find(bao.contracts.baskets, { nid }).basketContract
}

export const getRecipeContract = (bao: Bao) => {
	return bao && bao.contracts && bao.getContract('recipe')
}

export const getBaskets = (bao: Bao): ActiveSupportedBasket[] => {
	return bao && bao.contracts.baskets
}

export const getMarkets = (bao: Bao): ActiveSupportedMarket[] => {
	return bao && bao.contracts.markets
}

export const getGauges = (bao: Bao): ActiveSupportedGauge[] => {
	return bao && bao.contracts.gauges
}

export const getFarms = (bao: Bao): FarmableSupportedPool[] => {
	return bao
		? bao.contracts.pools.map(
				({
					pid,
					name,
					symbol,
					iconA,
					iconB,
					tokenAddresses,
					tokenAddress,
					tokenDecimals,
					tokenSymbol,
					tokenContract,
					lpAddresses,
					lpAddress,
					lpContract,
					refUrl,
					pairUrl,
					type,
					poolType,
				}) => ({
					pid,
					symbol,
					id: symbol,
					name,
					lpToken: symbol,
					lpTokenAddress: lpAddress,
					lpAddresses,
					lpAddress,
					lpContract,
					tokenAddresses,
					tokenAddress,
					tokenDecimals,
					tokenSymbol,
					tokenContract,
					earnToken: 'BAO',
					earnTokenAddress: bao.getContract('bao').address,
					iconA,
					iconB,
					refUrl,
					pairUrl,
					type,
					poolType,
				}),
		  )
		: []
}

export const getPoolWeight = async (masterChefContract: Contract, pid: number): Promise<BigNumber> => {
	const [{ allocPoint }, totalAllocPoint] = await Promise.all([
		masterChefContract.poolInfo(pid),
		masterChefContract.methods.totalAllocPoint(),
	])

	return new BigNumber(allocPoint.toString()).div(new BigNumber(totalAllocPoint.toString()))
}

export const getEarned = async (masterChefContract: Contract, pid: number, account: string): Promise<BigNumber> => {
	return new BigNumber((await masterChefContract.pendingReward(pid, account)).toString())
}

export const getLockedEarned = async (baoContract: Contract, account: string): Promise<BigNumber> => {
	return new BigNumber((await baoContract.lockOf(account)).toString())
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
	const portionLp = new BigNumber(balance.toString()).div(new BigNumber(totalSupply.toStrig()))
	const lpWethWorth = new BigNumber(lpContractWeth.toString())
	const totalLpWethValue = portionLp.times(lpWethWorth.toString()).times(new BigNumber(2))
	// Calculate
	const tokenAmount = new BigNumber(tokenAmountWholeLP.toString()).times(portionLp).div(new BigNumber(10).pow(tokenDecimals))

	const wethAmount = new BigNumber(lpContractWeth.toString()).times(portionLp).div(new BigNumber(10).pow(18))
	return {
		tokenAmount,
		wethAmount,
		totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
		tokenPriceInWeth: wethAmount.div(tokenAmount),
		poolWeight: poolWeight,
	}
}

export const approve = async (token: Contract, spender: Contract): Promise<string> => {
	return token.approve(spender.address, ethers.constants.MaxUint256)
}

export const stake = async (masterChefContract: Contract, pid: number, amount: string, ref: string): Promise<string> => {
	return masterChefContract
		.deposit(pid, ethers.utils.parseUnits(amount, 18), ref)
		.on('transactionHash', (tx: { transactionHash: string }) => {
			console.log(tx)
			return tx.transactionHash
		})
}

export const unstake = async (masterChefContract: Contract, pid: number, amount: string, ref: string): Promise<string> => {
	return masterChefContract
		.withdraw(pid, ethers.utils.parseUnits(amount, 18), ref)
		.on('transactionHash', (tx: { transactionHash: string }) => {
			console.log(tx)
			return tx.transactionHash
		})
}
export const harvest = async (masterChefContract: Contract, pid: number): Promise<string> => {
	return masterChefContract.claimReward(pid).on('transactionHash', (tx: { transactionHash: string }) => {
		console.log(tx)
		return tx.transactionHash
	})
}

export const getStaked = async (masterChefContract: Contract, pid: number, account: string): Promise<BigNumber> => {
	try {
		const { amount } = await masterChefContract.userInfo(pid, account)
		return new BigNumber(amount)
	} catch {
		return new BigNumber(0)
	}
}

export const getBaoSupply = async (bao: Bao) => {
	return new BigNumber(await bao.getContract('bao').totalSupply().toString())
}

export const getReferrals = async (masterChefContract: Contract, account: string): Promise<string> => {
	return await masterChefContract.getGlobalRefAmount(account)
}

export const getRefUrl = (): string => {
	let refer = '0x0000000000000000000000000000000000000000'
	const urlParams = new URLSearchParams(window.location.search)
	if (urlParams.has('ref')) {
		refer = urlParams.get('ref')
	}
	console.log(refer)

	return refer
}

export const redeem = async (masterChefContract: Contract): Promise<string> => {
	const now = new Date().getTime() / 1000
	if (now >= 1597172400) {
		return masterChefContract.exit().on('transactionHash', (tx: { transactionHash: string }) => {
			console.log(tx)
			return tx.transactionHash
		})
	} else {
		alert('pool not active')
	}
}

export const enter = async (contract: Contract | undefined, amount: string): Promise<string> => {
	return contract?.enter(exponentiate(amount).toString()).on('transactionHash', (tx: { transactionHash: string }) => {
		console.log(tx)
		return tx.transactionHash
	})
}

export const leave = async (contract: Contract, amount: string): Promise<string> => {
	return contract.leave(exponentiate(amount).toString()).on('transactionHash', (tx: { transactionHash: string }) => {
		console.log(tx)
		return tx.transactionHash
	})
}

export const fetchCalcToBasket = async (recipeContract: Contract, basketAddress: string, basketAmount: string) => {
	const amount = exponentiate(basketAmount)
	const amountEthNecessary = await recipeContract.calcToPie(basketAddress, amount.toFixed(0))
	return decimate(amountEthNecessary)
}

export const basketIssue = (recipeContract: Contract, _outputToken: string, _inputToken: string, _maxInput: BigNumber, _data: string) => {
	return recipeContract.methods.bake(_inputToken, _outputToken, exponentiate(_maxInput).toString(), _data)
}

export const basketRedeem = (basketContract: Contract, amount: string) => {
	return basketContract.exitPool(exponentiate(amount).toString())
}

export const getWethPriceLink = async (bao: Bao): Promise<BigNumber> => {
	const priceOracle = bao.contracts.getContract('wethPrice')
	const { wethPrice } = Multicall.parseCallResults(
		await bao.multicall.call(
			Multicall.createCallContext([
				{
					ref: 'wethPrice',
					contract: priceOracle,
					calls: [{ method: 'decimals' }, { method: 'latestRoundData' }],
				},
			]),
		),
	)

	return new BigNumber(wethPrice[1].values[1].toString()).div(10 ** wethPrice[0].values[0].toString())
}

export const getUserInfoChef = async (masterChefContract: Contract, pid: number, account: string) =>
	await masterChefContract.userInfo(pid, account)

export const getAccountLiquidity = async (comptrollerContract: Contract, account: string) =>
	await comptrollerContract.getAccountLiquidity(account)

export const getGaugeWeight = async (gaugeControllerContract: Contract, lpAddress: string) => {
	return new BigNumber(await gaugeControllerContract.get_gauge_weight(lpAddress))
}

export const getRelativeWeight = async (gaugeControllerContract: Contract, lpAddress: string) => {
	return new BigNumber(await gaugeControllerContract.gauge_relative_weight(lpAddress))
}

export const getInflationRate = async (gaugeContract: Contract) => {
	return new BigNumber(await gaugeContract.inflation_rate())
}

export const getMintable = async (currentEpoch: BigNumber, futureEpoch: BigNumber, tokenContract: Contract) => {
	return new BigNumber(await tokenContract.mintable_in_timeframe(currentEpoch, futureEpoch))
}

export const getVotingPower = async (votingEscrowContract: Contract, account: string) => {
	return new BigNumber(await votingEscrowContract.balanceOf(account))
}

export const getCurrentEpoch = async (tokenContract: Contract) => {
	return new BigNumber(await tokenContract.start_epoch_time_write())
}

export const getFutureEpoch = async (tokenContract: Contract) => {
	return new BigNumber(await tokenContract.future_epoch_time_write())
}

export const getVirtualPrice = async (poolContract: Contract) => {
	return new BigNumber(await poolContract.get_virtual_price())
}

export const getTotalSupply = async (depositContract: Contract) => {
	return new BigNumber(await depositContract.totalSupply())
}
