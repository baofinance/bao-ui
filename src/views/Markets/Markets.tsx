import React from 'react'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container } from 'react-bootstrap'
import { Switch } from 'react-router-dom'
import styled from 'styled-components'
import { Overview } from './components/Overview'
import {
	Borrow,
	Borrowed,
	Supplied,
	Supply,
} from './components/Tables'
import { SpinnerLoader } from '../../components/Loader'
import { useMarkets } from '../../hooks/hard-synths/useMarkets'
import { ProtocolStats } from './components/ProtocolStats'

const Markets: React.FC = () => {
	const markets = useMarkets()

	return (
		<Switch>
			<Page>
				<PageHeader icon="" title="Markets" subtitle="Mint, Lend, Borrow" />
				<Container>
					{markets ? (
						<>
							<Section>
								<Overview />
								<MarketOverview>
									<Supplied />
									<Borrowed />
								</MarketOverview>
								<MarketOverview>
									<Supply />
									<Borrow />
								</MarketOverview>
							</Section>
						</>
					) : (
						<SpinnerLoader block />
					)}
				</Container>
			</Page>
		</Switch>
	)
}

const Section = styled.div`
	display: block;
	width: 100%;
	padding-top: 0px;
	border-radius: ${(props) => props.theme.borderRadius}px;
`

const MarketOverview = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`

export default Markets
