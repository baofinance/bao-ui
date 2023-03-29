import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { CurveLp__factory, SaddleLp__factory, Uni_v2_lp__factory } from '@/typechain/factories'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import useBao from '../base/useBao'
import usePrice from '../base/usePrice'
import { useVaultPrice } from '../vaults/useVaultPrice'
import useGaugeInfo from './useGaugeInfo'
import usePoolInfo from './usePoolInfo'

const useGaugeTVL = (gauge: ActiveSupportedGauge) => {
	const { library, chainId } = useWeb3React()
	const bao = useBao()
	const poolInfo = usePoolInfo(gauge)
	const gaugeInfo = useGaugeInfo(gauge)
	const bSTBLPrice = useVaultPrice(Config.vaults['baoUSD'].markets[4].vaultAddresses[chainId])
	const baoUSDPrice = useVaultPrice(Config.vaults['baoUSD'].markets[0].vaultAddresses[chainId])
	const daiPrice = usePrice('dai')
	const ethPrice = usePrice('ethereum')
	const threeCrvPrice = usePrice('lp-3pool-curve')
	const baoPrice = usePrice('bao-finance-v2')

	console.log('bSTBLPrice', bSTBLPrice?.toString())
	console.log('baoUSDPrice', baoUSDPrice?.toString())
	console.log('daiPrice', daiPrice?.toString())
	console.log('ethPrice', ethPrice?.toString())
	console.log('threeCrvPrice', threeCrvPrice?.toString())
	console.log('baoPrice', baoPrice?.toString())

	const poolTVL = useMemo(() => {
		return (
			poolInfo &&
			(gauge.symbol === 'baoUSD3CRV'
				? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoUSD.toLowerCase()
					? baoUSDPrice && threeCrvPrice && baoUSDPrice.mul(poolInfo.token0Balance).add(threeCrvPrice.mul(poolInfo.token1Balance))
					: baoUSDPrice && threeCrvPrice && baoUSDPrice.mul(poolInfo.token1Balance).add(threeCrvPrice.mul(poolInfo.token0Balance))
				: gauge.symbol === 'bSTBLDAI'
				? bSTBLPrice
					? poolInfo?.token0Address.toLowerCase() === Config.addressMap.bSTBL.toLowerCase()
						? bSTBLPrice && daiPrice && bSTBLPrice.mul(poolInfo.token0Balance).add(daiPrice.mul(poolInfo.token1Balance))
						: bSTBLPrice && daiPrice && bSTBLPrice.mul(poolInfo.token1Balance).add(daiPrice.mul(poolInfo.token0Balance))
					: BigNumber.from(0)
				: gauge.symbol === 'BAOETH'
				? poolInfo?.token0Address.toLowerCase() === Config.addressMap.BAO.toLowerCase()
					? baoPrice && ethPrice && baoPrice.mul(poolInfo.token0Balance).add(ethPrice.mul(poolInfo.token1Balance))
					: baoPrice && ethPrice && baoPrice.mul(poolInfo.token1Balance).add(ethPrice.mul(poolInfo.token0Balance))
				: gauge.symbol === 'saddle-FRAXBP-baoUSD'
				? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoUSD.toLowerCase()
					? baoUSDPrice && daiPrice && baoUSDPrice.mul(poolInfo.token0Balance).add(daiPrice.mul(poolInfo.token1Balance))
					: baoUSDPrice && daiPrice && baoUSDPrice.mul(poolInfo.token1Balance).add(daiPrice.mul(poolInfo.token0Balance))
				: BigNumber.from(0))
		)
	}, [bSTBLPrice, baoPrice, baoUSDPrice, daiPrice, ethPrice, gauge.symbol, poolInfo, threeCrvPrice])

	const enabled = !!gauge && !!library && !!bao && !!poolTVL
	const { data: tvlData, refetch } = useQuery(
		['@/hooks/gauges/useGaugeTVL', providerKey(library), { enabled, gid: gauge.gid, poolTVL }],
		async () => {
			const curveLpContract = CurveLp__factory.connect(gauge.lpAddress, library)
			const uniLpContract = Uni_v2_lp__factory.connect(gauge.lpAddress, library)
			const saddleLpContract = SaddleLp__factory.connect(gauge.lpAddress, library)
			const query = Multicall.createCallContext([
				gauge.type.toLowerCase() === 'curve'
					? {
							contract: curveLpContract,
							ref: gauge?.lpAddress,
							calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
					  }
					: gauge.type.toLowerCase() === 'uniswap'
					? {
							contract: uniLpContract,
							ref: gauge?.lpAddress,
							calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
					  }
					: {
							contract: saddleLpContract,
							ref: gauge?.lpAddress,
							calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
					  },
			])
			const { [gauge?.lpAddress]: res0 } = Multicall.parseCallResults(await bao.multicall.call(query))

			const gaugeBalance = res0[0].values[0]
			const totalSupply = res0[1].values[0]
			const lpPrice = poolTVL && poolTVL.div(totalSupply)
			const gaugeTVL = lpPrice && lpPrice.mul(gaugeBalance)
			const depositAmount = lpPrice && gaugeInfo && lpPrice.mul(gaugeInfo.balance)

			return {
				gaugeTVL,
				depositAmount,
			}
		},
		{
			enabled,
			placeholderData: {
				gaugeTVL: BigNumber.from(0),
				depositAmount: BigNumber.from(0),
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
