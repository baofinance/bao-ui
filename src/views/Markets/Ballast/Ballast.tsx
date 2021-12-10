import React from 'react'
import Page from '../../../components/Page'
import PageHeader from '../../../components/PageHeader'
import { Container } from 'react-bootstrap'
import BallastSwapper from './components/BallastSwapper'
import { ConnectedCheck } from '../components/ConnectedCheck'

const Ballast: React.FC = () => {
	return (
		<Page>
			<PageHeader icon="" title="Ballast" />
			<Container>
				<ConnectedCheck>
					<BallastSwapper />
				</ConnectedCheck>
			</Container>
		</Page>
	)
}

export default Ballast
