import React from 'react'
import useBaskets from '../../hooks/baskets/useBaskets'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import BasketList from './components/BasketList'
import { Container } from 'react-bootstrap'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import Basket from './Basket'

const Baskets: React.FC = () => {
	const baskets = useBaskets()
	const { path } = useRouteMatch()

	return (
		<Switch>
			<Page>
				<PageHeader icon="" title="Baskets" />
				<Container>
					<Route exact path={path}>
						<BasketList baskets={baskets} />
					</Route>
					<Route path={`${path}/:basketId`}>
						<Basket />
					</Route>
				</Container>
			</Page>
		</Switch>
	)
}

export default Baskets
