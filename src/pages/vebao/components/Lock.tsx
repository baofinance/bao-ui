import Config from '@/bao/lib/config'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import GraphUtil from '@/utils/graph'
import { fromDecimal } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import 'rc-slider/assets/index.css'
import React from 'react'
import { Actions } from './Actions'
import BoostCalc from './BoostCalc'
import { LockStats, ProtocolStats, ProtocolStatsHoriz } from './Stats'

const Lock: React.FC = () => {
	const { library, chainId } = useWeb3React()
	const lockInfo = useLockInfo()
	const baoBalance = useTokenBalance(Config.contracts.Baov2[chainId].address)

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

	const { data: block } = useQuery(['timestamp'], async () => {
		const block = await library?.getBlock()
		return block
	})

	return (
		<>
			<div className='grid grid-cols-4 gap-4'>
				<Actions lockInfo={lockInfo} baoBalance={baoBalance} />
				<LockStats baoBalance={baoBalance} lockInfo={lockInfo} timestamp={block?.timestamp} />
			</div>
			<ProtocolStatsHoriz baoPrice={baoPrice} baoBalance={baoBalance} lockInfo={lockInfo} timestamp={block?.timestamp} />
			{/* Boost Calculator is borked, will fix soon */}
			{/* <BoostCalc lockInfo={lockInfo} /> */}
		</>
	)
}

export default Lock
