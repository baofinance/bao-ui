import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { decimate } from '@/utils/numberFormat'

import useBao from '../base/useBao'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'

export const useMarketsTVL = () => {
	const [tvl, setTvl] = useState<BigNumber | undefined>()
	const bao = useBao()
	const markets = useMarkets()
	const { prices } = useMarketPrices() // TODO- use market.price instead of market prices hook

	const fetchTvl = useCallback(async () => {
		const marketsTvl = markets.reduce(
			(prev, current) =>
				prev.add(decimate((current.supplied - current.totalBorrows) * prices[current.marketAddress], 36 - current.underlyingDecimals)),
			BigNumber.from(0),
		)
		// Assume $1 for DAI - need to use oracle price
		const ballastTvl = decimate(await bao.getContract('stabilizer').supply())
		setTvl(marketsTvl.add(ballastTvl))
	}, [markets, prices, bao])

	useEffect(() => {
		if (!(markets && prices && bao)) return

		fetchTvl()
	}, [markets, prices, bao, fetchTvl])

	return tvl
}
