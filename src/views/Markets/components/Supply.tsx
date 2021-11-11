import { endsWith } from 'lodash'
import React from 'react'
import { Col, FormCheck, Row, Table } from 'react-bootstrap'
import styled from 'styled-components'

const Supply: React.FC = () => (
	<>
	<div style={{
			display: 'block',
			justifyContent: 'center',
			width: '100%',
			marginTop: '2rem',
			padding: '2rem',
			paddingBottom: '0px',
			color: '#fff',	
			backgroundColor: '#000000f0',
			borderRadius: '8px',
	}}>
		<div
			style={{
				display: 'flex',
				width: '100%',
				justifyContent: 'flex-end',
				borderRadius: '8px',
				paddingRight: '1rem',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					paddingBottom: '0px',
					paddingTop: '0px',
					color: '#fff',
				}}
			>
				<TableContainer>
				<Table style={{width: '100%'}}>
					<thead>
						<tr>
							<th style={{ justifyContent: 'flex-start', textAlign: 'start', minWidth: '6rem' }}>Asset</th>
							<th style={{ justifyContent: 'center', textAlign: 'center', minWidth: '6rem' }}>APY</th>
							<th style={{ justifyContent: 'flex-end', textAlign: 'end', minWidth: '6rem' }}>Wallet</th>
						</tr>
					</thead>
					<tbody>
						<tr style={{ borderRadius: '1rem' }}>
							<td>
								<img
									src="USDC.png"
									style={{ width: '25px', height: '25px', verticalAlign: 'middle' }}
								/>
								{' '}USDC
							</td>
							<td style={{ justifyContent: 'center', textAlign: 'center', minWidth: '6rem' }}>5.00%</td>
							<td style={{ justifyContent: 'flex-end', textAlign: 'end', minWidth: '6rem' }}>
								0.00 USDC
							</td>
						</tr>
					</tbody>
				</Table>
				</TableContainer>
			</div>
		</div>
		</div>
	</>
)

const TableContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	overflow-x: auto;

	tbody {
		tr {
			cursor: pointer;

			&:hover {
				background-color: ${(props) => props.theme.color.transparent[200]};
			}
		}
	}
	
	th {
		justify-content: space-between;
		width: 100%;
		font-size: .875rem;
		font-weight: ${(props) => props.theme.fontWeight.medium};
		color: ${(props) => props.theme.color.text[200]};
		text-transform: uppercase;
		border: none;
	}

	td {
		border: none;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-weight: ${(props) => props.theme.fontWeight.medium};
		font-size: 0.875rem;
		padding-top: .25rem;
		padding-bottom: .25rem;
		padding-left: ${(props) => props.theme.spacing[2]}px;
		padding-right: ${(props) => props.theme.spacing[2]}px;
		color: ${(props) => props.theme.color.text[100]};
	}
`

export default Supply
