import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import GaugeList from './components/GaugeList'

const Gauges: React.FC = () => {
	return (
		<>
			<NextSeo title={'Gauges'} description={'Stake LP tokens to earn BAO.'} />
			<div className='grid gap-10 lg:grid-cols-5 lg:gap-24'>
				<div className='w-full lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Gauges
					</Typography>
					<Typography className='text-base font-light tracking-tight lg:mb-4'>
						Gauges incentivize user participation and liquidity provision in specific pools by allocating rewards based on contributions,
						driving engagement and maximizing returns.
					</Typography>
					<div className='hidden lg:block'>
						<a href='https://info.bao.finance/docs/guides/gauges/depositing-lps-for-rewards' target='_blank' rel='noopener noreferrer'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<GaugeList />
				</div>
			</div>
		</>
	)
}

export default Gauges
