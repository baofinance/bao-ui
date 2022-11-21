import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import GaugeList from './components/GaugeList'

const Gauges: React.FC = () => {
	return (
		<>
			<NextSeo title={'Gauges'} description={'Stake LP tokens to earn BAO.'} />
			<PageHeader title='Gauges' />
			<GaugeList />
		</>
	)
}

export default Gauges
