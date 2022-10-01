import Multicall from '@/utils/multicall'
import { decimate, exponentiate } from '@/utils/numberFormat'
import { ethers, BigNumber } from 'ethers'
import _ from 'lodash'
import { Contract } from '@ethersproject/contracts'
import { Bao } from './Bao'
import { ActiveSupportedGauge, ActiveSupportedMarket, FarmableSupportedPool } from './lib/types'

export const getWethContract = (bao: Bao): Contract => {
	return bao && bao.contracts && bao.getContract('weth')
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

export const getRecipeContract = (bao: Bao) => {
	return bao && bao.contracts && bao.getContract('recipe')
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
	const [{ allocPoint }, totalAllocPoint] = await Promise.all([masterChefContract.poolInfo(pid), masterChefContract.totalAllocPoint()])

	return allocPoint.div(totalAllocPoint)
}

export const getEarned = async (masterChefContract: Contract, pid: number, account: string): Promise<BigNumber> => {
	return masterChefContract.pendingReward(pid, account)
}

export const getLockedEarned = async (baoContract: Contract, account: string): Promise<BigNumber> => {
	return baoContract.lockOf(account)
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
		return BigNumber.from(amount)
	} catch {
		return BigNumber.from(0)
	}
}

export const getBaoSupply = async (bao: Bao) => {
	return await bao.getContract('bao').totalSupply()
}

// Remove when we get veBAO deployed
export const getCrvSupply = async (bao: Bao) => {
	return await bao.getContract('crv').totalSupply({ gasLimit: 100000 })
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
	return recipeContract.bake(_inputToken, _outputToken, exponentiate(_maxInput).toString(), _data)
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

	return wethPrice[1].values[1].mul(BigNumber.from(10).pow(wethPrice[0].values[0]))
}

export const getUserInfoChef = async (masterChefContract: Contract, pid: number, account: string) =>
	await masterChefContract.userInfo(pid, account)

export const getAccountLiquidity = async (comptrollerContract: Contract, account: string) => {
	return comptrollerContract.getAccountLiquidity(account, { gasLimit: 100000 })
}

export const getGaugeWeight = async (gaugeControllerContract: Contract, lpAddress: string) => {
	return gaugeControllerContract.get_gauge_weight(lpAddress, { gasLimit: 100000 })
}

export const getRelativeWeight = async (gaugeControllerContract: Contract, lpAddress: string) => {
	return gaugeControllerContract['gauge_relative_weight(address)'](lpAddress, { gasLimit: 100000 })
}

export const getInflationRate = async (gaugeContract: Contract) => {
	return gaugeContract.inflation_rate({ gasLimit: 100000 })
}

export const getMintable = async (currentEpoch: BigNumber, futureEpoch: BigNumber, tokenContract: Contract) => {
	return tokenContract.mintable_in_timeframe(currentEpoch, futureEpoch, { gasLimit: 100000 })
}

export const getVotingPower = async (votingEscrowContract: Contract, account: string) => {
	return votingEscrowContract.balanceOf(account, { gasLimit: 100000 })
}

export const getUserVotingPower = async (gaugeControllerContract: Contract, account: string) => {
	return await gaugeControllerContract.vote_user_power(account, { gasLimit: 100000 })
}

export const getCurrentEpoch = async (tokenContract: Contract) => {
	return tokenContract.start_epoch_time_write({ gasLimit: 100000 })
}

export const getFutureEpoch = async (tokenContract: Contract) => {
	return tokenContract.future_epoch_time_write({ gasLimit: 100000 })
}

export const getVirtualPrice = async (poolContract: Contract) => {
	return poolContract.get_virtual_price({ gasLimit: 100000 })
}

export const getTotalSupply = async (depositContract: Contract) => {
	return depositContract.totalSupply({ gasLimit: 100000 })
}
