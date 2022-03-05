import React from 'react'
import useFactory from '../../hooks/delphi/useFactory'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container } from 'react-bootstrap'
import { SpinnerLoader } from '../../components/Loader'
import OracleList from './components/OracleList'

const DelphiExplorer: React.FC = () => {
	const factory = useFactory()

	return (
		<Page>
			<PageHeader icon="" title="Delphi Explorer" />
			<Container>
				{factory ? (
					<OracleList oracles={factory.oracles} />
				) : (
					<SpinnerLoader block />
				)}
			</Container>
		</Page>
	)
}

export default DelphiExplorer
