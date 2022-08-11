import { useCallback, useEffect, useState } from 'react'
import useBaskets from './useBaskets'
import BigNumber from 'bignumber.js'

type Prices = {
	[address: string]: BigNumber
}

const useGeckoPrices = (): Prices => {
	const [prices, setPrices] = useState<Prices | undefined>()
	const baskets = useBaskets()

	const fetchPrices = useCallback(async () => {
		const allCgIds: any = baskets.reduce((prev, cur) => {
			const reversedCgIds = Object.keys(cur.cgIds).reduce((_prev, _cur) => ({ ..._prev, [cur.cgIds[_cur]]: _cur }), {})
			return { ...prev, ...reversedCgIds }
		}, {})

		const idsToQuery = Object.keys(allCgIds).join(',')
		const res = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsToQuery}&vs_currencies=usd`)).json()

		setPrices(
			Object.keys(res).reduce(
				(prev, cur) => ({
					...prev,
					[allCgIds[cur].toLowerCase()]: new BigNumber(res[cur].usd),
				}),
				{},
			),
		)
	}, [baskets])

	useEffect(() => {
		if (baskets) fetchPrices()
	}, [baskets])

	return prices
}

export default useGeckoPrices
