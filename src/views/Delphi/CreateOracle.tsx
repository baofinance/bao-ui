import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { getDisplayBalance } from '../../utils/numberFormat'
import useAvailableAggregators from '../../hooks/delphi/useAvailableAggregators'
import useFactory from '../../hooks/delphi/useFactory'
import useCreationInfo from '../../hooks/delphi/useCreationInfo'
import useTransactionHandler from '../../hooks/base/useTransactionHandler'
import useBao from '../../hooks/base/useBao'
import { useWallet } from 'use-wallet'
import {
	Col,
	Container,
	DropdownButton,
	FormControl,
	InputGroup,
	Row,
	Dropdown,
	Collapse,
	Alert,
} from 'react-bootstrap'
import Page from '../../components/Page'
import PageHeader from '../../components/PageHeader'
import ConnectedCheck from '../../components/ConnectedCheck'
import GuideCollapse from './components/GuideCollapse'
import { SubmitButton } from '../../components/Button/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StatBlock } from '../Markets/components/Stats'
import { Aggregator, Variables } from './types'
import CreationInformation from './components/CreationInformation'

const ALPHABET = 'abcdefghijklmnopqrstuvwrxyz'.split('')

const CreateOracle: React.FC = () => {
	const [showGuide, setShowGuide] = useState(false)
	const [variables, setVariables] = useState<Variables>({})
	const [newVariable, setNewVariable] = useState('')
	const [newConstant, setNewConstant] = useState('')
	const [name, setName] = useState('')
	const [equation, setEquation] = useState('')
	const [alert, setAlert] = useState<string | undefined>()

	const factory = useFactory()
	const aggregators = useAvailableAggregators(factory)
	const creationInfo = useCreationInfo(equation, variables)
	const bao = useBao()
	const txHandler = useTransactionHandler()
	const { account } = useWallet()

	const handleAddAggregator = (variable: string, aggregator: Aggregator) => {
		if (variable.length === 0) return

		setVariables({
			...variables,
			[variable]: {
				type: 'AGGREGATOR',
				aggregator: aggregator,
			},
		})
		setNewVariable('')
	}

	const handleAddConstant = (variable: string, value: string) => {
		if (variable.length === 0) return

		// Check if value passed is valid
		const val = new BigNumber(value)
		if (val.isNaN() || !val.isFinite()) return

		setVariables({
			...variables,
			[variable]: {
				type: 'CONSTANT',
				value: val,
			},
		})
		setNewConstant('')
	}

	const handleRemoveVariable = (variable: string) => {
		setVariables(
			Object.keys(variables).reduce((prev, cur) => {
				if (cur === variable) return prev

				return {
					...prev,
					[cur]: variables[cur],
				}
			}, {}),
		)
	}

	const aggregatorVariableKeys = useMemo(
		() =>
			Object.keys(variables).filter(
				(variable) => variables[variable].type === 'AGGREGATOR',
			),
		[variables],
	)

	const constantVariableKeys = useMemo(
		() =>
			Object.keys(variables).filter(
				(variable) => variables[variable].type === 'CONSTANT',
			),
		[variables],
	)

	return (
		<Page>
			<PageHeader icon="" title={(<FontAwesomeIcon icon="calculator" />)} />
			<Container>
				<ConnectedCheck>
					{alert && (
						<Alert
							variant={
								alert.toLowerCase().includes('error') ? 'danger' : 'success'
							}
							style={{ textAlign: 'center' }}
						>
							{alert}
						</Alert>
					)}
					<Row>
						{/* AGGREGATORS */}
						<StyledCol>
							<h3>Assign Variables</h3>
							<InputGroup className="mb-3">
								<StyledFormControl
									placeholder="x, y, z, etc."
									value={newVariable}
									onChange={(event: any) => {
										const val = event.target.value
										if (
											val.length == 0 ||
											(val.length == 1 && val.match(/[a-z]/i))
										) {
											setNewVariable(val)
										}
									}}
								/>
								<DropdownButton
									title="Aggregator"
									className="dropdown-button-custom"
									align="end"
								>
									{aggregators &&
										aggregators.map((aggregator) => (
											<Dropdown.Item
												onClick={() =>
													handleAddAggregator(newVariable, aggregator)
												}
												key={aggregator.id}
											>
												{aggregator.description}{' '}
												<FontAwesomeIcon icon="arrow-right" />{' '}
												{getDisplayBalance(
													aggregator.latestAnswer,
													aggregator.decimals,
												)}
											</Dropdown.Item>
										))}
								</DropdownButton>
							</InputGroup>
							<br />
							{aggregatorVariableKeys.length > 0 && (
								<StatBlock
									label={null}
									stats={aggregatorVariableKeys.map((key) => {
										const a = variables[key].aggregator
										return {
											label: `${key} = ${a.description} = ${getDisplayBalance(
												a.latestAnswer,
												a.decimals,
											)}e18`,
											value: (
												<>
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
						<StyledCol xs={1}>
							<h3 style={{ marginTop: 'calc(2.75rem)' }}>
								<a
									href="#"
									onClick={() => setShowGuide(!showGuide)}
									aria-expanded={showGuide}
									aria-controls="guide-collapse"
								>
									<FontAwesomeIcon icon="question-circle" />
								</a>
							</h3>
						</StyledCol>
						{/* CONSTANTS */}
						<StyledCol>
							<h3>Assign Constants</h3>
							<InputGroup className="mb-3">
								<StyledFormControl
									placeholder="1, 2, 3, etc."
									value={newConstant}
									onChange={(event: any) => setNewConstant(event.target.value)}
								/>
								<DropdownButton
									title="Variable"
									className="dropdown-button-custom"
									align="end"
								>
									{ALPHABET.map((letter) => (
										<Dropdown.Item
											onClick={() => handleAddConstant(letter, newConstant)}
											key={Math.random()}
										>
											{letter}
										</Dropdown.Item>
									))}
								</DropdownButton>
							</InputGroup>
							<br />
							{constantVariableKeys.length > 0 && (
								<StatBlock
									label={null}
									stats={constantVariableKeys.map((key) => {
										return {
											label: `${key} = ${variables[key].value.toString()}`,
											value: (
												<>
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
					</Row>
					{/* GUIDE COLLAPSE */}
					<Collapse in={showGuide}>
						<div id="guide-collapse">
							<GuideCollapse />
						</div>
					</Collapse>
					<br />
					<StyledFormControl
						placeholder="Oracle Name - ex. 2xETH"
						className="form-control"
						value={name}
						onChange={(event: any) => setName(event.target.value)}
					/>
					<br />
					<StyledFormControl
						as="textarea"
						placeholder="Equation - ex. x * y | NOTE: All ChainLink results are standardized to 18 decimals (1e18) for ease of use."
						className="form-control"
						value={equation}
						onChange={(event: any) => setEquation(event.target.value)}
					/>
					<br />
					{equation.length > 0 && (
						<CreationInformation creationInfo={creationInfo} name={name} />
					)}
					<SubmitButton
						disabled={
							!creationInfo ||
							name.length < 1 ||
							!creationInfo.output.isFinite() ||
							creationInfo.output.isNaN() ||
							creationInfo.output.eq(0)
						}
						onClick={async () => {
							txHandler.handleTx(
								bao
									.getContract('delphiFactory')
									.methods.createOracle(
										name,
										aggregatorVariableKeys.map(
											(variable) => variables[variable].aggregator.id,
										),
										creationInfo.polish,
									)
									.send({
										from: account,
										gasPrice: await bao.web3.eth.getGasPrice(),
									}),
								`Create Oracle - ${name}`,
								(err, receipt) => {
									if (err) setAlert(`Error creating oracle: ${err}`)
									else
										setAlert(
											`Success! Created ${name} Oracle at ${receipt.events['OracleCreation'].returnValues['_address']}.`,
										)
								},
							)
						}}
					>
						Create
					</SubmitButton>
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
