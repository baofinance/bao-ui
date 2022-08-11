import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useAccountLiquidity } from './useAccountLiquidity'
import { useAccountMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import Multicall from '../../utils/multicall'

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

		if (Object.keys(balanceRes).length === 0) return setHealthFactor(new BigNumber(0))

		const collateralSummation = _markets.reduce(
			(prev, cur) =>
				prev +
				new BigNumber(prices[cur.marketAddress])
					.div(10 ** (36 - cur.underlyingDecimals))
					.times(balanceRes[cur.marketAddress][0].values[0].hex)
					.div(10 ** cur.underlyingDecimals)
					.times(cur.collateralFactor)
					.toNumber(),
			0,
		)

		const _healthFactor = new BigNumber(collateralSummation / usdBorrow)
		setHealthFactor(_healthFactor.isNaN() ? new BigNumber(0) : _healthFactor)
	}, [markets, accountLiquidity, bao, account, prices])

	useEffect(() => {
		if (!(markets && accountLiquidity && bao && account && prices)) return

		fetchHealthFactor()
	}, [markets, accountLiquidity, bao, account, prices])

	return healthFactor
}

export default useHealthFactor
