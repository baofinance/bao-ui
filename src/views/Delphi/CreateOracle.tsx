import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import { getDisplayBalance } from '../../utils/numberFormat'
import useAvailableAggregators from '../../hooks/delphi/useAvailableAggregators'
import useFactory from '../../hooks/delphi/useFactory'
import PageHeader from '../../components/PageHeader'
import {
	Col,
	Container,
	DropdownButton,
	FormControl,
	InputGroup,
	Row,
	Dropdown,
} from 'react-bootstrap'
import Page from '../../components/Page'
import ConnectedCheck from '../../components/ConnectedCheck'
import { SubmitButton } from '../../components/Button/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StatBlock } from '../Markets/components/Stats'
import { Aggregator, Variables } from './types'
import { shuntingYard } from '../../utils/shuntingyard'

const CreateOracle: React.FC = () => {
	const [variables, setVariables] = useState<Variables>({})
	const [newVariable, setNewVariable] = useState('')
	const [equation, setEquation] = useState('')

	const factory = useFactory()
	const aggregators = useAvailableAggregators(factory)

	const handleAddVariable = (variable: string, aggregator: Aggregator) => {
		if (variable.length != 1 || !variable.match(/[a-z]/i)) return

		setVariables({
			...variables,
			[variable]: aggregator,
		})
	}

	const handleRemoveVariable = (variable: string) => {
		setVariables(
			Object.keys(variables).reduce((prev, cur) => {
				if (cur == variable) return prev

				return {
					...prev,
					[cur]: variables[cur],
				}
			}, {}),
		)
	}

	useEffect(() => {
		shuntingYard(equation)
	}, [equation])

	return (
		<Page>
			<PageHeader icon="" title="Create Oracle" />
			<Container>
				<ConnectedCheck>
					<Row>
						<StyledCol>
							<h3>Choose Variables</h3>
							<br />
							<InputGroup className="mb-3">
								<StyledFormControl
									placeholder="x, y, z, etc."
									value={newVariable}
									onChange={(event: any) => setNewVariable(event.target.value)}
								/>
								<DropdownButton
									variant="secondary"
									title="Aggregator"
									id="input-group-dropdown-1"
									align="end"
								>
									{aggregators &&
										aggregators.map((aggregator) => (
											<Dropdown.Item
												onClick={() =>
													handleAddVariable(newVariable, aggregator)
												}
											>
												{aggregator.description} <FontAwesomeIcon icon="arrow-right" />{' '}
												{getDisplayBalance(
													aggregator.latestAnswer,
													aggregator.decimals,
												)}
											</Dropdown.Item>
										))}
								</DropdownButton>
							</InputGroup>
							<br />
							{Object.keys(variables).length > 0 && (
								<StatBlock
									label={null}
									stats={Object.keys(variables).map((key) => {
										return {
											label: `${key} = ${variables[key].description}`,
											value: (
												<>
													{`${getDisplayBalance(
														variables[key].latestAnswer,
														variables[key].decimals,
													)} (e${variables[key].decimals})`}{' '}
													<a onClick={() => handleRemoveVariable(key)} href="#">
														<FontAwesomeIcon icon="trash" />
													</a>
												</>
											),
										}
									})}
								/>
							)}
						</StyledCol>
						<StyledCol>
							<h3>Creation Details</h3>
							<i>N/A</i>
						</StyledCol>
					</Row>
					<br />
					<StyledFormControl
						as="textarea"
						placeholder="x * 2"
						className="form-control"
						value={equation}
						onChange={(event: any) => setEquation(event.target.value)}
					/>
					<br />
					<SubmitButton>Create</SubmitButton>
				</ConnectedCheck>
			</Container>
		</Page>
	)
}

const StyledCol = styled(Col)`
	text-align: center;
`

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

export default CreateOracle
