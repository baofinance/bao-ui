import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
//import { Contract } from '@ethersproject/contracts'
import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import { decimate, exponentiate } from '@/utils/numberFormat'
import { parseUnits } from 'ethers/lib/utils'
//import { BigNumber } from 'ethers'
import useContract from '@/hooks/base/useContract'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { Cether__factory, Ctoken__factory, Erc20__factory } from '@/typechain/factories'
import type { Cether, Comptroller, Ctoken, MarketOracle } from '@/typechain/index'

type Cmarket = Cether | Ctoken

export const SECONDS_PER_BLOCK = 2
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

// FIXME: this should be ethers.BigNumber math
const toApy = (rate: BigNumber) => (Math.pow((rate.toNumber() / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100
//const toApy = (rate: BigNumber) => {
//const n = rate.mul(BLOCKS_PER_DAY).add(1)
//const ne = n.pow(DAYS_PER_YEAR)
//const apy = ne.sub(1).mul(100)
//console.log(formatUnits(apy, 36), n.toString())
//return apy
//}

export const useMarketsContext = (): ActiveSupportedMarket[] | undefined => {
	const { library, account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [markets, setMarkets] = useState<ActiveSupportedMarket[] | undefined>()

	const comptroller = useContract<Comptroller>('Comptroller')
	const oracle = useContract<MarketOracle>('MarketOracle')

	const fetchMarkets = useCallback(async () => {
		const signerOrProvider = account ? library.getSigner() : library
		const _markets = Config.markets
			.filter(market => !market.archived) // TODO- add in option to view archived markets
			.map(market => {
				const marketAddress = market.marketAddresses[chainId]
				const underlyingAddress = market.underlyingAddresses[chainId]
				let marketContract
				if (underlyingAddress === 'ETH') marketContract = Cether__factory.connect(marketAddress, signerOrProvider)
				else marketContract = Ctoken__factory.connect(marketAddress, signerOrProvider)
				let underlyingContract
				if (underlyingAddress !== 'ETH') underlyingContract = Erc20__factory.connect(underlyingAddress, signerOrProvider)
				return Object.assign(market, {
					marketAddress,
					marketContract,
					underlyingAddress,
					underlyingContract,
				})
			})

		const contracts: Cmarket[] = _markets.map((market: ActiveSupportedMarket) => {
			return market.marketContract
		})

		// FIXME: this should be one multicall per contract instead of HELLA ethereum rpc calls
		const [
			reserveFactors,
			totalReserves,
			totalBorrows,
			supplyRates,
			borrowRates,
			cashes,
			marketsInfo,
			totalSupplies,
			exchangeRates,
			borrowState,
			symbols,
			underlyingSymbols,
			liquidationIncentive,
			borrowRestricted,
			prices,
		] = await Promise.all([
			Promise.all(contracts.map(contract => contract.reserveFactorMantissa())),
			Promise.all(contracts.map(contract => contract.totalReserves())),
			Promise.all(contracts.map(contract => contract.totalBorrows())),
			Promise.all(contracts.map(contract => contract.supplyRatePerBlock())),
			Promise.all(contracts.map(contract => contract.borrowRatePerBlock())),
			Promise.all(contracts.map(contract => contract.getCash())),
			Promise.all(contracts.map(contract => comptroller.callStatic.markets(contract.address))),
			Promise.all(contracts.map(contract => contract.totalSupply())),
			Promise.all(contracts.map(contract => contract.callStatic.exchangeRateCurrent())),
			Promise.all(contracts.map(contract => comptroller.callStatic.compBorrowState(contract.address))),
			Promise.all(contracts.map(contract => contract.symbol())),
			Promise.all(_markets.map(market => (market.underlyingContract ? market.underlyingContract.symbol() : 'ETH'))),
			comptroller.callStatic.liquidationIncentiveMantissa(),
			Promise.all(contracts.map(market => comptroller.callStatic.borrowRestricted(market.address))),
			Promise.all(contracts.map(market => oracle.callStatic.getUnderlyingPrice(market.address))),
		])

		const supplyApys: BigNumber[] = supplyRates.map((rate: BigNumber) => parseUnits(toApy(rate).toString()))
		const borrowApys: BigNumber[] = borrowRates.map((rate: BigNumber) => parseUnits(toApy(rate).toString()))

		const newMarkets: ActiveSupportedMarket[] = contracts.map((contract, i) => {
			const marketConfig = _markets.find(market => market.marketAddresses[chainId] === contract.address)
			return {
				symbol: symbols[i],
				underlyingSymbol: underlyingSymbols[i],
				supplyApy: supplyApys[i],
				borrowApy: borrowApys[i],
				liquidity: cashes[i],
				totalReserves: totalReserves[i],
				totalBorrows: totalBorrows[i],
				collateralFactor: marketsInfo[i][1],
				imfFactor: marketsInfo[i][2],
				reserveFactor: reserveFactors[i],
				supplied: decimate(exchangeRates[i].mul(totalSupplies[i])),
				borrowable: borrowState[i][1] > 0,
				liquidationIncentive: decimate(liquidationIncentive.mul(10).sub(exponentiate(1))),
				borrowRestricted: borrowRestricted[i],
				price: prices[i],
				...marketConfig,
			}
		})

		setMarkets(newMarkets)
	}, [chainId, library, account, comptroller, oracle])

	useEffect(() => {
		if (!library || !chainId || !comptroller || !oracle) return
		fetchMarkets()
	}, [fetchMarkets, library, account, chainId, transactions, comptroller, oracle])

	return markets
}
