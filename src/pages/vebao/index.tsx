import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import usePrice from '@/hooks/base/usePrice'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import { useWeb3React } from '@web3-react/core'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import Dashboard from './components/Dashboard'
import Lock from './components/Lock'
import { ProtocolStats } from './components/Stats'
import { Icon } from '@/components/Icon'

const VeBAO: React.FC = () => {
	const { chainId } = useWeb3React()
	const lockInfo = useLockInfo()
	const veInfo = useVeInfo()
	const baoBalance = useTokenBalance(Config.contracts.Baov2[chainId].address)
	const baoPrice = usePrice('bao-finance-v2')

	return (
		<>
			<NextSeo
				title={'veBAO'}
				description={
					'veBAO enables users to lock governance tokens, amplifying their voting power to influence gauge weights and direct incentives within the ecosystem.'
				}
			/>
			<div className='mb-6 grid gap-4 lg:grid-cols-5 lg:gap-24'>
				<div className='w-full lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						veBAO
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Lock governance tokens, amplifying voting power to influence gauge weights and direct incentives within the ecosystem.
						</Typography>
					</div>
					<div className='hidden lg:block'>
						<a href='https://info.bao.finance/docs/distribution-tokenomics' target='_blank' rel='noopener noreferrer'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<ProtocolStats baoPrice={baoPrice} baoBalance={baoBalance} lockInfo={lockInfo} veInfo={veInfo} />
				</div>
			</div>

			<Lock />
			<Dashboard />
		</>
	)
}

export default VeBAO
