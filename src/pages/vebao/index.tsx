import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import usePrice from '@/hooks/base/usePrice'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import Dashboard from './components/Dashboard'
import Lock from './components/Lock'
import { ProtocolStats } from './components/Stats'

const VeBAO: React.FC = () => {
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
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<div className='mb-6 grid grid-cols-5 gap-32'>
				<div className='col-span-2'>
					<Typography variant='hero' className='stroke'>
						veBAO
					</Typography>
					<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
						Bao Vaults allow users to mint synthetic price-stable assets with our yield bearing Bao Baskets or ETH as collateral. Mint
						instantly and on your terms!
					</Typography>
					<a href='https://info.bao.finance/docs/distribution-tokenomics' target='_blank' rel='noopener noreferrer'>
						<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
					</a>
				</div>
				<div className='col-span-3'>
					<ProtocolStats baoPrice={baoPrice} baoBalance={baoBalance} lockInfo={lockInfo} veInfo={veInfo} timestamp={blockTimestamp} />
				</div>
			</div>

			<Lock />
			<Dashboard />
		</>
	)
}

export default VeBAO
