import Button from '@/components/Button'
import Typography from '@/components/Typography'
import VaultList from '@/pages/vaults/components/VaultList'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'

const Vaults: React.FC = () => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<div className='grid grid-cols-5 gap-32'>
				<div className='col-span-2'>
					<Typography variant='hero' className='stroke'>
						Vaults
					</Typography>
					<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
						Bao Vaults allow users to mint synthetic price-stable assets with our yield bearing Bao Baskets or ETH as collateral. Mint
						instantly and on your terms!
					</Typography>
					<a href='https://info.bao.finance/docs/franchises/bao-markets-hard-synths' target='_blank' rel='noopener noreferrer'>
						<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
					</a>
				</div>
				<div className='col-span-3'>
					<VaultList />
				</div>
			</div>
		</>
	)
}

export default Vaults
