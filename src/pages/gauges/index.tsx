import { NextSeo } from 'next-seo'
import React from 'react'

import PageHeader from '@/components/PageHeader'

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
