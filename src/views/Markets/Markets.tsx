import React from 'react'
import { useMarkets } from '../../hooks/hard-synths/useMarkets'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container } from 'react-bootstrap'
import { Switch } from 'react-router-dom'
import { Overview } from './components/Overview'
import { SpinnerLoader } from '../../components/Loader'
import { MarketList } from './components/MarketList'
import { ConnectedCheck } from './components/ConnectedCheck'

const Markets: React.FC = () => {
	const markets = useMarkets()

	return (
		<Switch>
			<Page>
				<PageHeader icon="" title="Markets" />
				<Container>
					<ConnectedCheck>
						<Overview />
						{markets ? (
							<MarketList markets={markets} />
						) : (
							<SpinnerLoader block />
						)}
					</ConnectedCheck>
				</Container>
			</Page>
		</Switch>
	)
}

export default Markets
