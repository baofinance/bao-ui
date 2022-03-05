import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import GraphUtil from '../../utils/graph'
import { SpinnerLoader } from '../../components/Loader'
import OracleList from './components/OracleList'

const DelphiExplorer: React.FC = () => {
	const [factory, setFactory] = useState<any | undefined>()

	// TODO: Move to hook
	useEffect(() => {
		GraphUtil.getDelphiFactoryInfo().then((res) => {
			setFactory(res)
		})
	}, [])

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
