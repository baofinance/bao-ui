import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { decimate } from '@/utils/numberFormat'

import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import useContract from '@/hooks/base/useContract'
import type { Stabilizer } from '@/typechain/index'

// FIXME: review decimate in here
export const useMarketsTVL = () => {
	const [tvl, setTvl] = useState<BigNumber | undefined>()
	const markets = useMarkets()
	const { prices } = useMarketPrices() // TODO- use market.price instead of market prices hook

	const stabilizer = useContract<Stabilizer>('Stabilizer')

	const fetchTvl = useCallback(async () => {
		const marketsTvl = markets.reduce((prev, current) => {
			const _tvl = BigNumber.from(current.supplied).sub(current.totalBorrows).mul(prices[current.marketAddress])
			return prev.add(decimate(_tvl, current.underlyingDecimals))
		}, BigNumber.from(0))

		// Assume $1 for DAI - need to use oracle price
		const ballastTvl = await stabilizer.supply()
		setTvl(marketsTvl.add(decimate(ballastTvl)))
	}, [stabilizer, markets, prices])

	useEffect(() => {
		if (markets && stabilizer && prices) {
			fetchTvl()
		}
	}, [fetchTvl, markets, stabilizer, prices])

	return tvl
}
