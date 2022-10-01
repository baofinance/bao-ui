import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
//import { BigNumber } from 'ethers'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import useContract from '@/hooks/base/useContract'
import { Cether__factory, Ctoken__factory, Erc20__factory } from '@/typechain/factories'
import type { Comptroller, MarketOracle } from '@/typechain/index'

export const SECONDS_PER_BLOCK = 2
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: number) => (Math.pow((rate / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100

export const useMarketsContext = (): ActiveSupportedMarket[] | undefined => {
	const { library, chainId, account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [markets, setMarkets] = useState<ActiveSupportedMarket[] | undefined>()

	const comptroller = useContract<Comptroller>('Comptroller')
	const oracle = useContract<MarketOracle>('MarketOracle')

	const fetchMarkets = useCallback(async () => {
		const signerOrProvider = account ? library.getSigner() : library
		const _markets = Config.markets.map(market => {
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

		const contracts: Contract[] = _markets.map((market: ActiveSupportedMarket) => {
			return market.marketContract
		})

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
		]: any = await Promise.all([
			Promise.all(contracts.map(contract => contract.reserveFactorMantissa())),
			Promise.all(contracts.map(contract => contract.totalReserves())),
			Promise.all(contracts.map(contract => contract.totalBorrows())),
			Promise.all(contracts.map(contract => contract.supplyRatePerBlock())),
			Promise.all(contracts.map(contract => contract.borrowRatePerBlock())),
			Promise.all(contracts.map(contract => contract.getCash())),
			Promise.all(contracts.map(contract => comptroller.markets(contract.address))),
			Promise.all(contracts.map(contract => contract.totalSupply())),
			Promise.all(contracts.map(contract => contract.callStatic.exchangeRateCurrent())),
			Promise.all(contracts.map(contract => comptroller.compBorrowState(contract.address))),
			Promise.all(
				_markets.map(market => {
					return market.marketContract.symbol()
				}),
			),
			Promise.all(
				_markets.map(market => {
					return market.underlyingContract ? market.underlyingContract.symbol() : 'ETH'
				}),
			),
			comptroller.liquidationIncentiveMantissa(),
			Promise.all(contracts.map(market => comptroller.borrowRestricted(market.address))),
			Promise.all(contracts.map(market => oracle.getUnderlyingPrice(market.address))),
		])

		const supplyApys: number[] = supplyRates.map((rate: number) => toApy(rate))
		const borrowApys: number[] = borrowRates.map((rate: number) => toApy(rate))

		let markets: ActiveSupportedMarket[] = contracts.map((contract, i) => {
			const marketConfig = _markets.find(market => market.marketAddresses[Config.networkId] === contract.address)
			// FIXME: this should all be using ethers.BigNumber
			return {
				symbol: symbols[i],
				underlyingSymbol: underlyingSymbols[i],
				supplyApy: supplyApys[i],
				borrowApy: borrowApys[i],
				borrowable: borrowState[i][1] > 0,
				liquidity: parseFloat(formatUnits(cashes[i], marketConfig.underlyingDecimals)),
				totalReserves: parseFloat(formatUnits(totalReserves[i], 18 /* see note */)),
				totalBorrows: parseFloat(formatUnits(totalBorrows[i], 18 /* see note */)),
				collateralFactor: parseFloat(formatEther(marketsInfo[i][1])),
				imfFactor: parseFloat(formatEther(marketsInfo[i][2])),
				reserveFactor: parseFloat(formatEther(reserveFactors[i])),
				liquidationIncentive: parseFloat(formatEther(liquidationIncentive.mul(10))) - 1,
				borrowRestricted: borrowRestricted[i],
				supplied: parseFloat(formatEther(exchangeRates[i])) * parseFloat(formatUnits(totalSupplies[i], marketConfig.underlyingDecimals)),
				price: parseFloat(formatUnits(prices[i], 36 - marketConfig.underlyingDecimals)),
				...marketConfig,
			}
		})
		markets = markets.filter((market: ActiveSupportedMarket) => !market.archived) // TODO- add in option to view archived markets

		setMarkets(markets)
	}, [account, chainId, library, comptroller, oracle])

	useEffect(() => {
		if (!library || !chainId || !comptroller || !oracle) return
		fetchMarkets()
	}, [fetchMarkets, library, chainId, transactions, comptroller, oracle])

	return markets
}
