import { NextSeo } from 'next-seo'
import React from 'react'

import PageHeader from '@/components/PageHeader'

import Balances from './components/Balances'
import FarmList from './components/FarmList'
import Card from '@/components/Card'
import Typography from '@/components/Typography'
import Link from 'next/link'

const Farms: React.FC = () => {
	return (
		<>
			<NextSeo title={'Farms'} description={'Stake LP tokens to earn BAO.'} />
			<PageHeader title='Farms' />
			<Balances />
			<FarmList />
		</>
	)
}

export default Farms
