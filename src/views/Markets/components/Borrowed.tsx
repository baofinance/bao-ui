import { endsWith } from 'lodash'
import React from 'react'
import { FormCheck, Row, Table } from 'react-bootstrap'
import styled from 'styled-components'

const Borrowed: React.FC = () => (
	<>
		<div
			style={{
				display: 'flex',
				width: '100%',
				justifyContent: 'flex-end',
				borderRadius: '8px',
				borderLeft: '1px #ffffff0f solid',
				paddingLeft: '1rem',
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
							<th style={{ justifyContent: 'flex-end', textAlign: 'end', minWidth: '6rem' }}>Balance</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<img
									src="USDC.png"
									style={{ width: '25px', height: '25px', verticalAlign: 'middle' }}
								/>
								{' '}USDC
							</td>
							<td style={{ justifyContent: 'center', textAlign: 'center', minWidth: '6rem' }}>5%</td>
							<td style={{ justifyContent: 'flex-end', textAlign: 'end', minWidth: '6rem' }}>$500</td>
						</tr>
					</tbody>
				</Table>
				<Row sm={2} style={{width: '100%', display: 'flex', marginTop: '2rem'}}>
				<p style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'start', marginTop: '2rem'}}>Total Borrowed</p>
				<p style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'right', marginTop: '2rem'}}>Net APR</p>
				</Row>
				<Row sm={2} style={{width: '100%', display: 'flex'}}>
				<p style={{display: 'flex', justifyContent: 'flex-start', textAlign: 'start', fontSize: '.875rem', color: '#ccc'}}>$150</p>
				<p style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'right', fontSize: '.875rem', color: '#ccc'}}>5.19%</p>
				</Row>
				</TableContainer>
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
			padding: 1rem;
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
		cursor: pointer;
		padding-top: .25rem;
		padding-bottom: .25rem;
		padding-left: ${(props) => props.theme.spacing[2]}px;
		padding-right: ${(props) => props.theme.spacing[2]}px;
		color: ${(props) => props.theme.color.text[100]};
	}
`

export default Borrowed
