import Page from 'components/Page'
import React, { useEffect, useRef } from 'react'
import { Container } from 'react-bootstrap'
import ProtocolData from './components/ProtocolData'
import SectionOne from './components/SectionOne'
import SectionTwo from './components/SectionTwo'
import SecuritySection from './components/SecuritySection'
import Spacer from 'components/Spacer'


const Home: React.FC = () => {

	return (
		<Page>
			<Container>
				<SectionOne />
				<ProtocolData />
				<SecuritySection />
				<Spacer size="lg" />
				<SectionTwo />
				{/* <PriceGraphs /> */}
			</Container>
		</Page>
	)
}

export default Home
