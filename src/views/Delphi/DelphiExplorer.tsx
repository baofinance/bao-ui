import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import useFactory from '../../hooks/delphi/useFactory'
import useAvailableAggregators from '../../hooks/delphi/useAvailableAggregators'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { Container, FormControl, Nav } from 'react-bootstrap'
import { SpinnerLoader } from '../../components/Loader'
import OracleList from './components/OracleList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DelphiExplorer: React.FC = () => {
	const [endorsedView, setEndorsedView] = useState(true)
	const [search, setSearch] = useState<string | undefined>()

	const factory = useFactory(search)
	const aggregators = useAvailableAggregators(factory)

	const endorsed = useMemo(
		() =>
			factory &&
			factory.oracles.filter((oracle) => factory.endorsed.includes(oracle.id)),
		[factory],
	)

	useEffect(() => {
		if (endorsedView) setSearch('ENDORSED')
		else setSearch('')
	}, [endorsedView])

	return (
		<Page>
			<PageHeader
				icon=""
				title={
					<>
						Delphi{' '}
						<FontAwesomeIcon icon="meteor" style={{ marginLeft: '15px' }} />
					</>
				}
			/>
			<Container>
				{factory ? (
					<>
						<Tabs fill variant="pills">
							<Nav.Item>
								<Nav.Link
									onClick={() => setEndorsedView(!endorsedView)}
									active={endorsedView}
								>
									Endorsed
								</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link
									onClick={() => setEndorsedView(!endorsedView)}
									active={!endorsedView}
								>
									All Oracles
								</Nav.Link>
							</Nav.Item>
						</Tabs>
						<br />
						{!endorsedView && (
							<>
								<StyledFormControl
									type="text"
									placeholder="Search by oracle name (Case Sensitive)"
									style={{ margin: '0 12px', width: 'calc(100% - 24px)' }}
									value={search}
									onChange={(event: any) => {
										if (event.target.value.length === 0) setSearch(undefined)
										else setSearch(event.target.value)
									}}
								/>
								<br />
							</>
						)}
						<OracleList
							oracles={endorsedView ? endorsed : factory.oracles}
							aggregators={aggregators}
						/>
					</>
				) : (
					<SpinnerLoader block />
				)}
			</Container>
		</Page>
	)
}

const StyledFormControl = styled(FormControl)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-color: ${(props) => props.theme.color.primary[200]};
	color: ${(props) => props.theme.color.text[100]};

	&:focus {
		background-color: ${(props) => props.theme.color.primary[100]};
		border-color: ${(props) => props.theme.color.primary[300]};
		color: ${(props) => props.theme.color.text[100]};
		outline: none;
		box-shadow: none;
	}
`

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
