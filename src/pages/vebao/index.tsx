import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import Lock from './components/Lock'

const veBAO: React.FC = () => {
	return (
		<>
			<NextSeo title={`veBAO`} description={`Lock your BAO for veBAO!`} />
			<PageHeader title='veBAO' />
			<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 text-center font-light tracking-tight'>
				Lock your BAO for veBAO to increase your governance power and earn rewards!
			</Typography>

			<Lock />
		</>
	)
}

export default veBAO
