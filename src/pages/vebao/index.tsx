import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import BoostCalc from './components/BoostCalc'
import Lock from './components/Lock'

const veBAO: React.FC = () => {
	return (
		<>
			<NextSeo title={`veBAO`} description={`Lock your BAO for veBAO!`} />
			<PageHeader title='veBAO' />

			<Lock />
			<BoostCalc />
		</>
	)
}

export default veBAO
