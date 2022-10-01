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
		const marketsTvl = markets.reduce(
			(prev, current) =>
				prev.add(decimate((current.supplied - current.totalBorrows) * prices[current.marketAddress], 36 - current.underlyingDecimals)),
			BigNumber.from(0),
		)
		// Assume $1 for DAI - need to use oracle price
		const ballastTvl = decimate(await stabilizer.supply())
		setTvl(marketsTvl.add(ballastTvl))
	}, [stabilizer, markets, prices])

	useEffect(() => {
		if (!(markets && stabilizer && prices)) return
		fetchTvl()
	}, [fetchTvl, stabilizer, markets, prices])

	return tvl
}
