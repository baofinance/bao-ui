import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import MarketList from './components/MarketList'

const Markets: React.FC = () => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<PageHeader title='Vaults' />
			<>
				<MarketList />
			</>
		</>
	)
}

export default Markets
