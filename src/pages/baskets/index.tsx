import Page from '@/components/Page'
import Spacer from '@/components/Spacer'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import { StyledInfo } from '@/pages/nft/components/styles'
import { NextSeo } from 'next-seo'
import React from 'react'
import BasketList from './components/BasketList'

const Baskets: React.FC = () => {
	const baskets = useBaskets()

	return (
		<>
			<NextSeo title={`Baskets`} description={`Get diversified exposure to crypto assets with Bao Baskets!`} />
			<Page>
				<Typography variant='hero' className='font-strong text-center tracking-tighter text-text-100 antialiased'>
					Bao Baskets
				</Typography>
				<Typography className=''>
					Bao Baskets allow users to get balanced exposure to digital assets on the Ethereum Network. Baskets are designed to be truly
					set-and-forget, maximizing your returns at a fraction of the cost and effort. Baskets leverage automated strategies utilizing
					staking, lending, and yield farming- No management or constant monitoring necessary!
				</Typography>
				<BasketList baskets={baskets} />
			</Page>
		</>
	)
}

export default Baskets
