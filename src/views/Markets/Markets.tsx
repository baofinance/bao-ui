import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { useMarkets } from 'hooks/markets/useMarkets'
import React from 'react'
import { Container } from 'react-bootstrap'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { SpinnerLoader } from 'components/Loader'
import { ConnectedCheck } from './components/ConnectedCheck'
import { MarketList } from './components/MarketList'
import { Overview } from './components/Overview'
import Market from './Market'

const Markets: React.FC = () => {
	const markets = useMarkets()
	const { path } = useRouteMatch()

	return (
		<Switch>
			<Page>
				<PageHeader
					icon=""
					title="Markets"
					subtitle="Mint synthethic assets with multiple types of collateral!"
				/>
				<ConnectedCheck>
					<Route exact path={path}>
						<Container>
							<Overview />
							{markets ? (
								<MarketList markets={markets} />
							) : (
								<SpinnerLoader block />
							)}
						</Container>
					</Route>
					<Route path={`${path}/:marketId`}>
						<Market />
					</Route>
				</ConnectedCheck>
			</Page>
		</Switch>
	)
}

export default Markets
