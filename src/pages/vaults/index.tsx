import Button from '@/components/Button'
import Typography from '@/components/Typography'
import VaultList from '@/pages/vaults/components/VaultList'
import { NextSeo } from 'next-seo'
import React from 'react'

const Vaults: React.FC = () => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<div className='grid gap-10 lg:grid-cols-5 lg:gap-24'>
				<div className='w-full lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Vaults
					</Typography>
					<Typography className='text-base font-light tracking-tight lg:mb-4'>
						Mint price-stable synthetic assets instantly and on your terms, utilizing our yield-bearing Bao Baskets or ETH as collateral.
					</Typography>
					<div className='hidden lg:block'>
						<a href='https://info.bao.finance/docs/franchises/bao-markets-hard-synths' target='_blank' rel='noopener noreferrer'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<VaultList />
				</div>
			</div>
		</>
	)
}

export default Vaults
