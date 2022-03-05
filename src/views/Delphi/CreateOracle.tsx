import React, { useEffect, useState } from 'react'
import Multicall from '../../utils/multicall'
import GraphUtil from '../../utils/graph'
import useBao from '../../hooks/base/useBao'
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
import { SubmitButton } from '../../components/Button/Button'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { getDisplayBalance } from '../../utils/numberFormat'
import ConnectedCheck from '../../components/ConnectedCheck'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {StatBlock} from "../Markets/components/Stats";

const CreateOracle: React.FC = () => {
	const [factory, setFactory] = useState<any | undefined>()
	const [aggregators, setAggregators] = useState<Aggregator[]>([])
	const [variables, setVariables] = useState<Variables>({})
	const [newVariable, setNewVariable] = useState('')

	const bao = useBao()

	// TODO: Move to hook
	useEffect(() => {
		GraphUtil.getDelphiFactoryInfo().then((res) => {
			setFactory(res)
		})
	}, [])

	// TODO: Move to hook
	useEffect(() => {
		if (!(bao && factory)) return

		const callContext = Multicall.createCallContext(
			factory.aggregators.map((aggregator: any) => ({
				ref: aggregator,
				contract: bao.getNewContract('chainoracle.json', aggregator),
				calls: [
					{ method: 'decimals' },
					{ method: 'description' },
					{ method: 'latestAnswer' },
				],
			})),
		)

		bao.multicall.call(callContext).then((_res) => {
			const res = Multicall.parseCallResults(_res)
			const _aggregators: Aggregator[] = Object.keys(res).map((key) => ({
				id: key,
				decimals: res[key][0].values[0],
				description: res[key][1].values[0],
				latestAnswer: new BigNumber(res[key][2].values[0].hex),
			}))
			setAggregators(_aggregators)
		})
	}, [bao, factory])

	const handleAddVariable = (variable: string, aggregator: Aggregator) => {
		if (variable.length != 1 || !variable.match(/[a-z]/i)) return

		setVariables({
			...variables,
			[variable]: aggregator,
		})
		console.log({
			...variables,
			[variable]: aggregator,
		})
	}

	return (
		<Page>
			<PageHeader icon="" title="Create Oracle" />
			<Container>
				<ConnectedCheck>
					<Row>
						<StyledCol>
							<h3>Choose Variables</h3>
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
												{aggregator.description} -{' '}
												{getDisplayBalance(
													aggregator.latestAnswer,
													aggregator.decimals,
												)}
											</Dropdown.Item>
										))}
								</DropdownButton>
							</InputGroup>
							<br />
							<StatBlock label={"Variables"} stats={Object.keys(variables).map((key) => {
								return {
									label: variables[key].description,
									value: `${getDisplayBalance(variables[key].latestAnswer, variables[key].decimals)} (e${variables[key].decimals})`
								}
							})} />
						</StyledCol>
						<StyledCol>
							<h3>Sample Output</h3>
							<i>N/A</i>
						</StyledCol>
					</Row>
					<br />
					<StyledFormControl
						as="textarea"
						placeholder="x * 2"
						className="form-control"
					/>
					<br />
					<SubmitButton>Create</SubmitButton>
				</ConnectedCheck>
			</Container>
		</Page>
	)
}

type Variables = {
	[varLetter: string]: Aggregator
}

type Aggregator = {
	id: string
	description: string
	decimals: number
	latestAnswer: BigNumber
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
