import sushiData from '@sushiswap/sushi-data'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

// xSUSHI APY must be fetched from the sushi subgraph
const useSushiBarApy = () => {
	const [apy, setApy] = useState<BigNumber | undefined>()

	const fetchApy = useCallback(async () => {
		const sushiApy = await fetchSushiApy()
		setApy(sushiApy)
	}, [setApy])

	useEffect(() => {
		fetchApy()
	}, [fetchApy])

	return apy
}

export const fetchSushiApy = async (): Promise<BigNumber> => {
	const info = await sushiData.bar.info()
	// Get last 7 days worth of volume data
	const dayData = await sushiData.exchange.dayData({
		minTimestamp: parseInt(
			// 7 days ago (eth timestamps are in seconds, not ms)
			(new Date(new Date().getTime() - 86400000 * 7).getTime() / 1000).toFixed(0),
		),
	})
	const derivedETH = await sushiData.sushi.priceETH()

	const avgVolumeWeekly = dayData.reduce((prev, cur) => prev.add(cur.volumeETH), BigNumber.from(0)).div(dayData.length)

	// FIXME: this is broken for ethers.BigNumber i think idk
	return avgVolumeWeekly.mul(0.05).mul(0.01).div(info.totalSupply).mul(365).div(BigNumber.from(info.ratio).mul(derivedETH)).mul(1e18)
}

export default useSushiBarApy
