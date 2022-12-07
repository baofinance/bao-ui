import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import { CurveLp__factory, Uni_v2_lp__factory } from '@/typechain/factories'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import useBao from '../base/useBao'
import usePrice from '../base/usePrice'
import useBasketInfo from '../baskets/useBasketInfo'
import useBaskets from '../baskets/useBaskets'
import useComposition from '../baskets/useComposition'
import useNav from '../baskets/useNav'
//import useGaugeInfo from './useGaugeInfo'
import usePoolInfo from './usePoolInfo'
import { providerKey } from '@/utils/index'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useGaugeTVL = (gauge: ActiveSupportedGauge) => {
	const { library, chainId, account } = useWeb3React()
	const bao = useBao()
	const poolInfo = usePoolInfo(gauge)
	//const gaugeInfo = useGaugeInfo(gauge)

	//Get bSTBL price. Probably not the best way to do so, but it works for now.
	const baskets = useBaskets()
	const basket = useMemo(() => {
		if (!baskets) return
		return baskets.find(basket => basket.symbol === 'bSTBL')
	}, [baskets])
	const info = useBasketInfo(basket)
	const composition = useComposition(basket)
	const bSTBLPrice = useNav(composition, info ? info.totalSupply : BigNumber.from(0))

	const baoUSDPrice = usePrice('dai')
	const daiPrice = usePrice('dai')
	const ethPrice = usePrice('ethereum')
	const threeCrvPrice = usePrice('lp-3pool-curve')

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const baoPrice = usePrice('bao-finance-v2')

	const poolTVL = useMemo(() => {
		return (
			poolInfo &&
			bSTBLPrice &&
			(gauge.symbol === 'baoUSD3CRV'
				? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoUSD.toLowerCase()
					? baoUSDPrice.mul(poolInfo.token0Balance).add(threeCrvPrice.mul(poolInfo.token1Balance))
					: baoUSDPrice.mul(poolInfo.token1Balance).add(threeCrvPrice.mul(poolInfo.token0Balance))
				: gauge.symbol === 'bSTBLDAI'
				? bSTBLPrice
					? poolInfo?.token0Address.toLowerCase() === Config.addressMap.bSTBL.toLowerCase()
						? bSTBLPrice.mul(poolInfo.token0Balance).add(daiPrice.mul(poolInfo.token1Balance))
						: bSTBLPrice.mul(poolInfo.token1Balance).add(daiPrice.mul(poolInfo.token0Balance))
					: BigNumber.from(0)
				: gauge.symbol === 'BAOETH'
				? poolInfo?.token0Address.toLowerCase() === Config.addressMap.BAO.toLowerCase()
					? baoPrice.mul(poolInfo.token0Balance).add(ethPrice.mul(poolInfo.token1Balance))
					: baoPrice.mul(poolInfo.token1Balance).add(ethPrice.mul(poolInfo.token0Balance))
				: BigNumber.from(0))
		)
	}, [bSTBLPrice, baoPrice, baoUSDPrice, daiPrice, ethPrice, gauge.symbol, poolInfo, threeCrvPrice])

	const enabled = !!gauge && !!library && !!bao && !!poolTVL
	const { data: tvlData, refetch } = useQuery(
		['@/hooks/gauges/useGaugeTVL', providerKey(library, account, chainId), { enabled, gid: gauge.gid, poolTVL }],
		async () => {
			const curveLpContract = CurveLp__factory.connect(gauge.lpAddress, library)
			const uniLpContract = Uni_v2_lp__factory.connect(gauge.lpAddress, library)
			const query = Multicall.createCallContext([
				gauge.type.toLowerCase() === 'curve'
					? {
							contract: curveLpContract,
							ref: gauge?.lpAddress,
							calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
					  }
					: {
							contract: uniLpContract,
							ref: gauge?.lpAddress,
							calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
					  },
			])
			const { [gauge?.lpAddress]: res0 } = Multicall.parseCallResults(await bao.multicall.call(query))

			const gaugeBalance = res0[0].values[0]
			const totalSupply = res0[1].values[0]
			const lpPrice = poolTVL && poolTVL.div(totalSupply)
			const gaugeTVL = lpPrice && lpPrice.mul(gaugeBalance)

			// FIXME: please do boosted TVL from a different hook Vital! When you see this lol. Trust me.
			//const boostedTVL = lpPrice && gaugeInfo && lpPrice.mul(gaugeInfo.workingSupply)
			const boostedTVL = BigNumber.from(0)

			return {
				gaugeTVL,
				boostedTVL,
			}
		},
		{
			enabled,
			placeholderData: {
				gaugeTVL: undefined,
				boostedTVL: undefined,
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return tvlData
}

export default useGaugeTVL
