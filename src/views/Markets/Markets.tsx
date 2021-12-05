import React from 'react'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container } from 'react-bootstrap'
import { Switch } from 'react-router-dom'
import { Overview } from './components/Overview'
import { SpinnerLoader } from '../../components/Loader'
import { useMarkets } from '../../hooks/hard-synths/useMarkets'
import { MarketList } from './components/MarketList'

const Markets: React.FC = () => {
	const markets = useMarkets()

	return (
		<Switch>
			<Page>
				<PageHeader icon="" title="Markets" subtitle="Mint, Lend, Borrow" />
				<Container>
					<Overview />
					{markets ? <MarketList markets={markets} /> : <SpinnerLoader block />}
				</Container>
			</Page>
		</Switch>
	)
}

export default Markets
