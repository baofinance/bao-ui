import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import VaultList from '@/pages/vaults/components/VaultList'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'

const Vaults: React.FC = () => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<PageHeader title='Vaults' />
			<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
				Bao Vaults allow users to mint synthetic price-stable assets with our yield bearing Bao Baskets or ETH as collateral. Mint instantly
				and on your terms!
			</Typography>
			<VaultList />
		</>
	)
}

export default Vaults
