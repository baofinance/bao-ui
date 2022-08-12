import Page from '@/components/Page'
import PageHeader from '@/components/PageHeader'
import Spacer from '@/components/Spacer'
import { NextSeo } from 'next-seo'
import { StyledInfo } from '@/pages/nft/components/styles'
import React from 'react'
import { Container } from 'react-bootstrap'
import useBaskets from '@/hooks/baskets/useBaskets'
import BasketList from './components/BasketList'

const Baskets: React.FC = () => {
	const baskets = useBaskets()

	return (
		<Page>
			<NextSeo title={`Baskets`} description={`Get diversified exposure to crypto assets with Bao Baskets!`} />
			<PageHeader icon='' title='Bao Baskets' />
			<Container>
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
			</Container>
		</Page>
	)
}

export default Baskets
