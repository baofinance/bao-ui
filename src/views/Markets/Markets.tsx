import Page from 'components/Page'
import React, { useEffect, useRef } from 'react'
import { Container } from 'react-bootstrap'
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
					<SectionHeader>
						Dashboard
					</SectionHeader>
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
			</Container>
		</Page>
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
	background-color: ${(props) => props.theme.color.transparent[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;
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
}
`

export default Markets
