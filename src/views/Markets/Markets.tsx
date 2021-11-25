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
								<SectionHeader>Dashboard</SectionHeader>
								<SectionInner>
									<Overview />
									<UserOverview>
										<Supplied />
										<Borrowed />
									</UserOverview>
								</SectionInner>
							</Section>
							<MarketOverview>
								<Supply />
								<Borrow />
							</MarketOverview>
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
	padding: ${(props) => props.theme.spacing[4]}px;
	padding-top: 0px;
	border-radius: ${(props) => props.theme.borderRadius}px;
`

const SectionHeader = styled.div`
	color: ${(props) => props.theme.color.text[100]};
	font-size: 1.25rem;
	font-weight: ${(props) => props.theme.fontWeight.strong};
	margin: 0;
	text-align: center;
	align-content: center;
	padding-bottom: ${(props) => props.theme.spacing[2]}px;
`

const SectionInner = styled.div`
	justify-content: center;
	width: 100%;
	background-color: ${(props) => props.theme.color.primary[200]};
	border-radius: ${(props) => props.theme.borderRadius}px;
	box-shadow: ${(props) => props.theme.boxShadow.hover};
`

const UserOverview = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`

const MarketOverview = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`

export default Markets
