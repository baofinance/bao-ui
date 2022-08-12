import React from 'react'
import useBaskets from '../../hooks/baskets/useBaskets'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import BasketList from './components/BasketList'
import { Container } from 'react-bootstrap'
import { StyledInfo } from 'views/NFT/components/styles'
import Spacer from 'components/Spacer'
import { Helmet } from 'react-helmet'

const Baskets: React.FC = () => {
	const baskets = useBaskets()

	return (
		<Page>
			<Helmet>
				<title>Bao | Baskets</title>
				<meta name='description' content='Diversified exposure to crypto with automated yield strategies.' />
			</Helmet>
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
