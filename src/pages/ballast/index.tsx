import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import Ballast from './components/Ballast'

const Vaults: React.FC = () => {
	return (
		<>
			<NextSeo title={'Ballast'} description={'Mint and redeem Bao synths for an equivalent asset.'} />
			<div className='grid grid-cols-5 gap-32'>
				<div className='col-span-2'>
					<Typography variant='hero' className='stroke'>
						Ballast
					</Typography>
					<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
						The Ballast allow users to mint or redeem Bao synths with an equivalent asset for a 1% fee. This represents an opportunity for
						low-risk arbitrage between the ballast and the markets.
					</Typography>
					<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
				</div>
				<div className='col-span-3'>
					<Ballast />
				</div>
			</div>
		</>
	)
}

export default Vaults
