import Page from 'components/Page'
import React, { useEffect, useRef } from 'react'
import { Container } from 'react-bootstrap'
import Section from 'components/Section'
import pollyNests from 'assets/img/polly-nests.png'
import PageHeader from 'components/PageHeader'
import Overview from './components/Overview'
import Supplied from './components/Supplied'
import Borrowed from './components/Borrowed'
import Supply from './components/Supply'
import Borrow from './components/Borrow'
import styled from 'styled-components'

const Markets: React.FC = () => {
	return (
		<Page>
			<PageHeader
				icon={pollyNests}
				title="Markets"
				subtitle="Mint, Lend, Borrow"
			/>
			<Container>
				<Section>
					<Overview />
					<MarketOverview>
						<Supplied />
						<Borrowed />
					</MarketOverview>
				</Section>
					<MarketOverview>
						<Supply />
						<Borrow />
					</MarketOverview>
			</Container>
		</Page>
	)
}

const MarketOverview = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	margin-top: ${(props) => props.theme.spacing[4]}px;
`

export default Markets
