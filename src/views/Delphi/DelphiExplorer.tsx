import React, { useMemo, useState } from 'react'
import useFactory from '../../hooks/delphi/useFactory'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container, Nav } from 'react-bootstrap'
import { SpinnerLoader } from '../../components/Loader'
import OracleList from './components/OracleList'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DelphiExplorer: React.FC = () => {
	const factory = useFactory()

	const [endorsedView, setEndorsedView] = useState(true)

	const endorsed = useMemo(
		() =>
			factory &&
			factory.oracles.filter((oracle) => factory.endorsed.includes(oracle.id)),
		[factory],
	)

	return (
		<Page>
			<PageHeader icon="" title="Delphi Explorer" />
			<Container>
				{factory ? (
					<>
						<Tabs fill variant="pills">
							<Nav.Item>
								<Nav.Link
									onClick={() => setEndorsedView(!endorsedView)}
									active={endorsedView}
								>
									<FontAwesomeIcon icon="award" />{' '}
									Endorsed
								</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link
									onClick={() => setEndorsedView(!endorsedView)}
									active={!endorsedView}
								>
									<FontAwesomeIcon icon="list" />{' '}
									All Oracles
								</Nav.Link>
							</Nav.Item>
						</Tabs>
						<br />
						<OracleList oracles={endorsedView ? endorsed : factory.oracles} />
					</>
				) : (
					<SpinnerLoader block />
				)}
			</Container>
		</Page>
	)
}

const Tabs = styled(Nav)`
	margin: 0 12px;

	.nav-item > a {
		color: ${(props) => props.theme.color.text[100]};

		&.active {
			color: ${(props) => props.theme.color.text[100]};
			background-color: ${(props) => props.theme.color.primary[100]};
		}
	}
`

export default DelphiExplorer
