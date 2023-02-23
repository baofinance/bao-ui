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
				Bao Vaults allow users to mint synthetics with our yield bearing Bao Baskets or ETH. Vaults and Baskets together unlocks the
				potential for users to maintain exposure to an asset as well as the yield it earns, giving users a safe and reliable way to earn
				passively on underlying collateral while still being able to put their value to work.
			</Typography>
			<VaultList />
		</>
	)
}

export default Vaults
