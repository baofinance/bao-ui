import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import Multicall from '@/utils/multicall'

import useBao from '../base/useBao'
import { useAccountLiquidity } from './useAccountLiquidity'
import { useAccountMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

// FIXME: this used to end up as infinity with bignumber.js but now it doesn't with ethers.BigNumber
const useHealthFactor = () => {
	const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>()
	const bao = useBao()
	const { account } = useWeb3React()
	const markets = useAccountMarkets()
	const accountLiquidity = useAccountLiquidity()
	const { prices } = useMarketPrices()

	const fetchHealthFactor = useCallback(async () => {
		const { usdBorrow } = accountLiquidity
		const _markets = markets.filter(market => !market.isSynth)

		const balanceQuery = Multicall.createCallContext(
			_markets.map(market => ({
				contract: market.marketContract,
				ref: market.marketAddress,
				calls: [{ method: 'balanceOfUnderlying', params: [account] }],
			})),
		)
		const balanceRes = Multicall.parseCallResults(await bao.multicall.call(balanceQuery))

		if (Object.keys(balanceRes).length === 0) return setHealthFactor(BigNumber.from(0))

		const collateralSummation = _markets.reduce((prev, cur) => {
			return prev.add(
				BigNumber.from(prices[cur.marketAddress])
					.div(BigNumber.from(10).pow(36 - cur.underlyingDecimals))
					.mul(parseUnits(balanceRes[cur.marketAddress][0].values[0].toString()))
					.div(BigNumber.from(10).pow(cur.underlyingDecimals))
					.mul(parseUnits(cur.collateralFactor.toString())),
			)
		}, BigNumber.from(0))

		console.log(collateralSummation.toString())
		console.log(usdBorrow)

		try {
			const _healthFactor = BigNumber.from(parseFloat(formatUnits(collateralSummation)) / usdBorrow)
			setHealthFactor(_healthFactor)
		} catch {
			setHealthFactor(BigNumber.from(0))
		}
	}, [markets, accountLiquidity, bao, account, prices])

	useEffect(() => {
		if (!(markets && accountLiquidity && bao && account && prices)) return

		fetchHealthFactor()
	}, [markets, accountLiquidity, bao, account, prices])

	return healthFactor
}

export default useHealthFactor
