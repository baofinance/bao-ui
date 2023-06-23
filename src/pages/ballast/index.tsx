import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import BallastCard from './components/Ballast'
import { Icon } from '@/components/Icon'

const Ballast: React.FC = () => {
	return (
		<>
			<NextSeo title={'Ballast'} description={'Mint and redeem Bao synths for an equivalent asset.'} />
			<div className='grid lg:grid-cols-5 lg:gap-24'>
				<div className='w-full lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Ballast
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Mint or redeem synths with an equivalent asset for a small fee.
						</Typography>
					</div>
					<div className='hidden lg:block'>
						<a href='https://info.bao.finance/docs/guides/bao-markets/ballast' target='_blank' rel='noopener noreferrer'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='mt-10 lg:col-span-3 lg:mt-0'>
					<BallastCard />
				</div>
			</div>
		</>
	)
}

export default Ballast
