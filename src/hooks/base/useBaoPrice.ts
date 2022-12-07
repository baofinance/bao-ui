import Config from '@/bao/lib/config'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { fromDecimal } from '@/utils/numberFormat'
import GraphUtil from '@/utils/graph'

const useBaoPrice = () => {
	const { chainId } = useWeb3React()

	const { data: baoPrice } = useQuery(
		['@/hooks/base/useBaoPrice', { chainId }, { WETH: true, BAO: true }],
		async () => {
			const wethPrice = await GraphUtil.getPrice(Config.contracts.Weth[chainId].address)
			const _baoPrice = await GraphUtil.getPriceFromPair(wethPrice, Config.contracts.Baov2[chainId].address)
			return fromDecimal(_baoPrice)
		},
		{
			enabled: !!chainId,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: BigNumber.from(0),
		},
	)

	return baoPrice
}

export default useBaoPrice
