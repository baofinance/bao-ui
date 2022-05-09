import React from 'react'
import useBaskets from '../../hooks/baskets/useBaskets'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import BasketList from './components/BasketList'
import { Container } from 'react-bootstrap'

const Baskets: React.FC = () => {
	const baskets = useBaskets()

	return (
		<Page>
			<PageHeader icon="" title="Baskets" />
			<Container>
				<BasketList baskets={baskets} />
			</Container>
		</Page>
	)
}

export default Baskets
