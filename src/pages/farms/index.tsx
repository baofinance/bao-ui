import Page from '@/components/Page'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import Balances from './components/Balances'
import FarmList from './components/FarmList'

const Farms: React.FC = () => {
	return (
		<>
			<NextSeo title={'Farms'} description={'Stake LP tokens to earn BAO.'} />
			<Page>
				<Typography variant='hero' className='font-strong text-text-100 text-center tracking-tighter antialiased'>Farms</Typography>
				<Balances />
				<FarmList />
			</Page>
		</>
	)
}

export default Farms
