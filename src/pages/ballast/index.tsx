import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import React from 'react'
import { Container } from 'react-bootstrap'
import BallastSwapper from './components/BallastSwapper'
import { Helmet } from 'react-helmet'

const Ballast: React.FC = () => {
	return (
		<Page>
			<Helmet>
				<title>Bao | Ballast</title>
				<meta name='description' content='Buy and sell baoUSD for DAI.' />
			</Helmet>
			<PageHeader icon='' title='Ballast' />
			<Container>
				<BallastSwapper />
			</Container>
		</Page>
	)
}

export default Ballast
