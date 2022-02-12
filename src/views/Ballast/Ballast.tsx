import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import React from 'react'
import { Container } from 'react-bootstrap'
import ConnectedCheck from 'components/ConnectedCheck'
import BallastSwapper from './components/BallastSwapper'

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
