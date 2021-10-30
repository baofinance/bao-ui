import Page from 'components/Page'
import React, { useEffect, useRef } from 'react'
import { Container } from 'react-bootstrap'
import Spacer from 'components/Spacer'
import pollyNests from 'assets/img/polly-nests.png'
import PageHeader from 'components/PageHeader'
import Overview from './components/Overview'
import Supplied from './components/Supplied'
import Borrowed from './components/Borrowed'
import Supply from './components/Supply'
import Borrow from './components/Borrow'

const Markets: React.FC = () => {
	return (
		<Page>
			<PageHeader
				icon={pollyNests}
				title="Markets"
				subtitle="Mint, Lend, Borrow"
			/>
			<Container>
			<Overview />
			<Supplied />
			<Borrowed />
			<Supply />
			<Borrow />
			</Container>
		</Page>
	)
}

export default Markets
