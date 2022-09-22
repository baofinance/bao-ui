import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from '@ethersproject/contracts'

import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import useBao from '@/hooks/base/useBao'
import { decimate } from '@/utils/numberFormat'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'

export const SECONDS_PER_BLOCK = 2
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: number) => (Math.pow((rate / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100

export const useMarketsContext = (): ActiveSupportedMarket[] | undefined => {
	const bao = useBao()
	const { library } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [markets, setMarkets] = useState<ActiveSupportedMarket[] | undefined>()

	const fetchMarkets = useCallback(async () => {
		const contracts: Contract[] = bao.contracts.markets.map((market: ActiveSupportedMarket) => {
			return bao.getNewContract(market.marketAddress, market.underlyingAddress === 'ETH' ? 'cether.json' : 'ctoken.json')
		})
		const comptroller: Contract = bao.getContract('comptroller')
		const oracle: Contract = bao.getContract('marketOracle')

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
				bao.contracts.markets.map(market => {
					return market.marketContract.symbol()
				}),
			),
			Promise.all(
				bao.contracts.markets.map(market => {
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
			const marketConfig = bao.contracts.markets.find(market => market.marketAddresses[Config.networkId] === contract.address)
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
		console.log(markets)
	}, [bao, library, transactions])

	useEffect(() => {
		if (!(bao && library)) return
		fetchMarkets()
	}, [bao, library, transactions])

	return markets
}
