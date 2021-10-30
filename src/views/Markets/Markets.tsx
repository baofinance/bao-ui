import Page from 'components/Page'
import React, { useEffect, useRef } from 'react'
import { Container } from 'react-bootstrap'
import Spacer from 'components/Spacer'
import pollyNests from 'assets/img/polly-nests.png'
import PageHeader from 'components/PageHeader'

const Markets: React.FC = () => {
	return (
		<Page>
			<PageHeader
				icon={pollyNests}
				title="Markets"
				subtitle="Mint, Lend, Borrow"
			/>
			<Container></Container>
		</Page>
	)
}

export default Markets
