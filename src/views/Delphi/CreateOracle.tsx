import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { getDisplayBalance } from '../../utils/numberFormat'
import useAvailableAggregators from '../../hooks/delphi/useAvailableAggregators'
import useFactory from '../../hooks/delphi/useFactory'
import useCreationInfo from '../../hooks/delphi/useCreationInfo'
import useTransactionHandler from '../../hooks/base/useTransactionHandler'
import useBao from '../../hooks/base/useBao'
import { useWallet } from 'use-wallet'
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
import Tooltipped from '../../components/Tooltipped'
import { SubmitButton } from '../../components/Button/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StatBlock } from '../Markets/components/Stats'
import { Aggregator, Variables } from './types'
import BigNumber from 'bignumber.js'

const ALPHABET = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

const CreateOracle: React.FC = () => {
	const [variables, setVariables] = useState<Variables>({})
	const [newVariable, setNewVariable] = useState('')
	const [newConstant, setNewConstant] = useState('')
	const [equation, setEquation] = useState('')
	const [name, setName] = useState('')

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
			<PageHeader icon="" title="Create Oracle" />
			<Container>
				<ConnectedCheck>
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
									variant="secondary"
									title="Aggregator"
									id="input-group-dropdown-1"
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
											label: `${key} = ${a.description} = ${`${getDisplayBalance(
												a.latestAnswer,
												a.decimals,
											)}e18`}`,
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
									variant="secondary"
									title="Variable"
									id="input-group-dropdown-1"
									align="end"
								>
									{ALPHABET.map((letter) => (
										<Dropdown.Item
											onClick={() => handleAddConstant(letter, newConstant)}
											key={letter}
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
						placeholder="Equation - ex. x * y"
						className="form-control"
						value={equation}
						onChange={(event: any) => setEquation(event.target.value)}
					/>
					<br />
					{equation.length > 0 && (
						<>
							<h3>Creation Details</h3>
							{creationInfo ? (
								<StatBlock
									label={null}
									stats={[
										{
											label: 'Est. Creation Tx Fee',
											value: `${getDisplayBalance(
												creationInfo.txFee.toString(),
											)} ETH`,
										},
										{
											label: 'Name',
											value: name.length === 0 ? '~' : name,
										},
										{
											label: 'Raw Polish Notation',
											value: (
												<span>
													{creationInfo.polish.join(', ')}{' '}
													<a href="https://github.com/baofinance/delphi/blob/master/src/math/Equation.sol#L9-L35">
														<Tooltipped content="The Delphi Oracle contract takes in an equation formatted in polish notation (prefix). All operators are formatted as OPCODES, and their mappings can be found in the GitHub repo (click the ? to navigate)." />
													</a>
												</span>
											),
										},
										{
											label: 'Sample Result',
											value: '~',
										},
									]}
								/>
							) : (
								<>
									<i>
										Could not get creation info. There may be another oracle that
										performs the same operation, or your equation may be
										incomplete.
									</i>
									<br />
								</>
							)}
							<br />
						</>
					)}
					<SubmitButton
						disabled={!creationInfo || name.length < 1}
						onClick={async () => {
							txHandler.handleTx(
								bao
									.getContract('delphiFactory')
									.methods.createOracle(
										name,
										Object.keys(variables)
											.filter((key) => variables[key].type === 'AGGREGATOR')
											.map((variable) => variables[variable].aggregator.id),
										creationInfo.polish,
									)
									.send({
										from: account,
										gasPrice: await bao.web3.eth.getGasPrice(),
									}),
								`Create Oracle - ${name}`,
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
