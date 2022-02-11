import React from 'react'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import { Container } from 'react-bootstrap'
import BallastSwapper from './components/BallastSwapper'
import { ConnectedCheck } from '../Markets/components/ConnectedCheck'

const Ballast: React.FC = () => {
	return (
		<Page>
			<PageHeader icon="" title="Ballast" />
			<ConnectedCheck>
				<Container>
					<BallastSwapper />
				</Container>
			</ConnectedCheck>
		</Page>
	)
}

export default Ballast
