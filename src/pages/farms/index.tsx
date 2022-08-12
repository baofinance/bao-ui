import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import React from 'react'
import { Container } from 'react-bootstrap'
import { Helmet } from 'react-helmet'
import Balances from './components/Balances'
import { FarmList } from './components/FarmList'

const Farms: React.FC = () => {
	return (
		<Page>
			<Helmet>
				<title>Bao | Farms</title>
				<meta name='description' content='Stake liquidity tokens to earn BAO!' />
			</Helmet>
			<PageHeader icon='' title='Farms' />
			<Container>
				<Balances />
				<FarmList />
			</Container>
		</Page>
	)
}

export default Farms
