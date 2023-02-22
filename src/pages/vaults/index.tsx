import PageHeader from '@/components/PageHeader'
import { NextSeo } from 'next-seo'
import React from 'react'
import VaultList from './components/VaultList'

const Vaults: React.FC = () => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<PageHeader title='Vaults' />
			<>
				<VaultList />
			</>
		</>
	)
}

export default Vaults
