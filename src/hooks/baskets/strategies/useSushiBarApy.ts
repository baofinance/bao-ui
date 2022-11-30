import sushiData from '@sushiswap/sushi-data'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

// xSUSHI APY must be fetched from the sushi subgraph
const useSushiBarApy = () => {
	const { library, account, chainId } = useWeb3React()

	const enabled = !!library
	const { data: sushiApy, refetch } = useQuery(
		['@/hooks/baskets/strategies/useSushiBarApy', providerKey(library, account, chainId), { enabled }],
		async () => {
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

			const _sushiApy = avgVolumeWeekly
				.mul(0.05)
				.mul(0.01)
				.div(info.totalSupply)
				.mul(365)
				.div(BigNumber.from(info.ratio).mul(derivedETH))
				.mul(1e18)

			return _sushiApy
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return sushiApy
}

export default useSushiBarApy
