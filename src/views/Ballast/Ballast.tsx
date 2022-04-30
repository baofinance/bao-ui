import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import React from 'react'
import { Container } from 'react-bootstrap'
import BallastSwapper from './components/BallastSwapper'

const Ballast: React.FC = () => {
	return (
		<Page>
			<PageHeader icon="" title="Ballast" />
			<Container>
				<BallastSwapper />
			</Container>
		</Page>
	)
}

export default Ballast
