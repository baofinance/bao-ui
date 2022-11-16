import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import { CurveLp__factory, Uni_v2_lp__factory } from '@/typechain/factories'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useBao from '../base/useBao'
import usePrice from '../base/usePrice'
import useTransactionHandler from '../base/useTransactionHandler'
import useBasketInfo from '../baskets/useBasketInfo'
import useBaskets from '../baskets/useBaskets'
import useComposition from '../baskets/useComposition'
import useNav from '../baskets/useNav'
import usePoolInfo from './usePoolInfo'

const useGaugeTVL = (gauge: ActiveSupportedGauge) => {
	const { library, chainId, account } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library
	const [gaugeTVL, setGaugeTVL] = useState<BigNumber | undefined>()
	const bao = useBao()
	const { txSuccess } = useTransactionHandler()
	const poolInfo = usePoolInfo(gauge)

	//Get bSTBL price. Probably not the best way to do so, but it works for now.
	const baskets = useBaskets()
	const basket = useMemo(() => {
		if (!baskets) return
		return baskets.find(basket => basket.symbol === 'bSTBL')
	}, [baskets])
	const info = useBasketInfo(basket)
	const composition = useComposition(basket)
	const bSTBLPrice = useNav(composition, info ? info.totalSupply : BigNumber.from(0))

	const baoUSDPrice = parseUnits('1')
	const daiPrice = usePrice('dai')
	const ethPrice = usePrice('ethereum')
	const threeCrvPrice = usePrice('lp-3pool-curve')

	const { data: baoPrice } = useQuery(
		['GraphUtil.getPriceFromPair', { WETH: true, BAO: true }],
		async () => {
			const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
			const _baoPrice = await GraphUtil.getPriceFromPair(wethPrice, Config.contracts.Bao[chainId].address)
			return fromDecimal(_baoPrice)
		},
		{
			enabled: !!chainId,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: BigNumber.from(0),
		},
	)

	const poolTVL =
		poolInfo &&
		bSTBLPrice &&
		(gauge.symbol === 'baoUSD3CRV'
			? poolInfo?.token0Address === Config.addressMap.baoUSD
				? baoUSDPrice.mul(poolInfo.token0Balance).add(threeCrvPrice.mul(poolInfo.token1Balance))
				: baoUSDPrice.mul(poolInfo.token1Balance).add(threeCrvPrice.mul(poolInfo.token0Balance))
			: gauge.symbol === 'bSTBLDAI'
			? bSTBLPrice
				? poolInfo?.token0Address === Config.addressMap.bSTBL
					? bSTBLPrice.mul(poolInfo.token0Balance).add(daiPrice.mul(poolInfo.token1Balance))
					: bSTBLPrice.mul(poolInfo.token1Balance).add(daiPrice.mul(poolInfo.token0Balance))
				: BigNumber.from(0)
			: gauge.symbol === 'BAOETH'
			? poolInfo?.token0Address === Config.addressMap.BAO
				? baoPrice.mul(poolInfo.token0Balance).add(ethPrice.mul(poolInfo.token1Balance))
				: baoPrice.mul(poolInfo.token1Balance).add(ethPrice.mul(poolInfo.token0Balance))
			: BigNumber.from(0))

	// console.log('DAI Price', formatUnits(daiPrice))
	// console.log('ETH Price', formatUnits(ethPrice))
	// console.log('3CRV Price', formatUnits(threeCrvPrice))
	// console.log('baoUSD Price', formatUnits(baoUSDPrice))
	// console.log('bSTBL Price', formatUnits(bSTBLPrice ? bSTBLPrice : BigNumber.from(0)).toString())
	// console.log('Baov2 Price', formatUnits(baoPrice.mul(BigNumber.from(1000))).toString())

	const curveLpContract = CurveLp__factory.connect(gauge.lpAddress, signerOrProvider)
	const uniLpContract = Uni_v2_lp__factory.connect(gauge.lpAddress, signerOrProvider)
	const fetchGaugeTVL = useCallback(async () => {
		const query = Multicall.createCallContext([
			gauge.type === 'curve'
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

		// console.log('Gauge Name', gauge.name)
		// console.log('Token 0 Address', poolInfo?.token0Address)
		// console.log('Token 0 Balance', formatUnits(poolInfo?.token0Balance))
		// console.log('Token 1 Address', poolInfo?.token1Address)
		// console.log('Token 1 Balance', formatUnits(poolInfo?.token1Balance))
		// console.log('Bao Price', baoPrice && formatUnits(baoPrice))
		// console.log('ETH Price', ethPrice && formatUnits(ethPrice))
		// console.log('Pool TVL', poolTVL && formatUnits(baoPrice.mul(poolInfo.token0Balance).add(ethPrice.mul(poolInfo.token1Balance))))
		// console.log('Total Supply', totalSupply && formatUnits(totalSupply))
		// console.log('LP Price', formatUnits(lpPrice))
		// console.log('Gauge Balance', formatUnits(gaugeBalance))
		// console.log('Gauge TVL', formatUnits(gaugeTVL))

		setGaugeTVL(gaugeTVL)
	}, [curveLpContract, gauge, bao, poolTVL])

	// console.log('Gauge Name', gauge.name)

	useEffect(() => {
		if (!(bao && account && gauge)) return
		fetchGaugeTVL()
	}, [account, bao, gauge, txSuccess])

	return gaugeTVL
}

export default useGaugeTVL
