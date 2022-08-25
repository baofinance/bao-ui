import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import BasketList from './components/BasketList'

const Baskets: React.FC = () => {
	const baskets = useBaskets()

	return (
		<>
			<NextSeo title={`Baskets`} description={`Get diversified exposure to crypto assets with Bao Baskets!`} />
			<PageHeader title='Baskets' />
			<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
				Bao Baskets allow users to get balanced exposure to digital assets on the Ethereum Network. Baskets are designed to be truly
				set-and-forget, maximizing your returns at a fraction of the cost and effort. Baskets leverage automated strategies utilizing
				staking, lending, and yield farming- No management or constant monitoring necessary!
			</Typography>
			<BasketList baskets={baskets} />
		</>
	)
}

export default Baskets
