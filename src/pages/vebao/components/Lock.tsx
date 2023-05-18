import Config from '@/bao/lib/config'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import 'rc-slider/assets/index.css'
import React from 'react'
import Actions from './Actions'
//import BoostCalc from './BoostCalc'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import usePrice from '@/hooks/base/usePrice'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import { providerKey } from '@/utils/index'
import LockStats, { ProtocolStatsHoriz } from './Stats'

const Lock: React.FC = () => {
	const { library, account, chainId } = useWeb3React()
	const lockInfo = useLockInfo()
	const veInfo = useVeInfo()
	const baoBalance = useTokenBalance(Config.contracts.Baov2[chainId].address)
	const baoPrice = usePrice('bao-finance-v2')

	const enabled = !!library
	const { data: blockTimestamp, refetch } = useQuery(
		['block timestamp', providerKey(library, account, chainId)],
		async () => {
			const block = await library.getBlock()
			return block.timestamp as BigNumber
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	//useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 1)

	return (
		<>
			<div className='grid grid-cols-4 gap-4'>
				<Actions lockInfo={lockInfo} baoBalance={baoBalance} />
				<LockStats baoBalance={baoBalance} lockInfo={lockInfo} timestamp={blockTimestamp} />
			</div>
		</>
	)
}

export default Lock
