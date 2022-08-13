import Page from '@/components/Page'
import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import { Container } from 'react-bootstrap'
import { Helmet } from 'react-helmet'
import Balances from './components/Balances'
import { FarmList } from './components/FarmList'

const Farms: React.FC = () => {
	return (
		<>
			<NextSeo title={'Farms'} description={'Stake LP tokens to earn BAO.'} />
			<div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
				<h1 className='font-kaushan text-xxxl antialiased font-strong text-center tracking-tighter text-text-dark-100'>Farms</h1>
				<Balances />
				<FarmList />
			</div>
		</>
	)
}

export default Farms
