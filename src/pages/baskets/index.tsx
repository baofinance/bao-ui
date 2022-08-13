import Spacer from '@/components/Spacer'
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
			<div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
				<h1 className='font-kaushan text-xxxl antialiased font-strong text-center tracking-tighter text-text-dark-100'>Bao Baskets</h1>
				<StyledInfo>
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							flex: 1,
							justifyContent: 'center',
						}}
					>
						Bao Baskets allow users to get balanced exposure to digital assets on the Ethereum Network. Baskets are designed to be truly
						set-and-forget, maximizing your returns at a fraction of the cost and effort. Baskets leverage automated strategies utilizing
						staking, lending, and yield farming- No management or constant monitoring necessary!
					</div>
				</StyledInfo>
				<Spacer size='md' />
				<BasketList baskets={baskets} />
			</div>
		</>
	)
}

export default Baskets
