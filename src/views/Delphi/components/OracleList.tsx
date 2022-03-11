import React, { useMemo, useState } from 'react'
import _ from 'lodash'
import Config from '../../../bao/lib/config'
import useOracleValues from '../../../hooks/delphi/useOracleValues'
import { formatAddress } from '../../../utils'
import { decimate, getDisplayBalance } from '../../../utils/numberFormat'
import { nodesToTex } from '../../../utils/equation'
import { SpinnerLoader } from '../../../components/Loader'
import { Accordion, Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ParentSize } from '@visx/responsive'
import Tooltipped from '../../../components/Tooltipped'
import { DayData, Oracle } from '../types'
import AreaGraph, {
	TimeseriesData,
} from '../../../components/Graphs/AreaGraph/AreaGraph'
import { StatBlock } from '../../Markets/components/Stats'
import { MathComponent } from 'mathjax-react'

const OracleList: React.FC<{ oracles: Oracle[] }> = ({
	oracles,
}: {
	oracles: Oracle[]
}) => {
	const oracleValues = useOracleValues(oracles)

	const OracleListHeader: React.FC<{ headers: string[] }> = ({
		headers,
	}: {
		headers: string[]
	}) => {
		return (
			<Container fluid>
				<Row style={{ padding: '0.5rem 12px' }}>
					{headers.map((header: string) => (
						<OracleListHeaderCol style={{ paddingBottom: '0px' }} key={header}>
							<b>{header}</b>
						</OracleListHeaderCol>
					))}
				</Row>
			</Container>
		)
	}

	const OracleListItem: React.FC<{ oracle: Oracle }> = ({
		oracle,
	}: {
		oracle: Oracle
	}) => {
		const [open, setOpen] = useState(false)

		const dataExists = useMemo(() => {
			return oracle && oracle.dayData && oracle.dayData.length >= 2
		}, [oracle])

		const timeseriesData: TimeseriesData[] | undefined = useMemo(() => {
			// Don't load timeseries data if it doesn't exist or the accordion is not open
			if (!(dataExists && open)) return

			let mutableData = JSON.parse(JSON.stringify(oracle.dayData)) // Create mutable copy of oracle's dayData
			return _.reverse(mutableData).map((day: DayData) => ({
				high: decimate(day.high).toNumber(),
				low: decimate(day.low).toNumber(),
				open: decimate(day.open).toNumber(),
				close: decimate(day.close).toNumber(),
				date: new Date(parseInt(day.timestamp) * 1000).toString(),
			}))
		}, [oracle, open])

		const latexEq = useMemo(
			() => nodesToTex(oracle, oracle.equationNodes[0]),
			[oracle, open],
		)

		return (
			<Accordion>
				<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
					<StyledAccordionHeader
						onClick={() => setOpen(!open)}
					>
						<Row lg={7} style={{ width: '100%' }}>
							<Col>
								{oracle.endorsed && (
									<Tooltipped content="Endorsed by Protocol">
										<a href="#">
											<FontAwesomeIcon
												icon="award"
												style={{ color: '#d0ae3e' }}
											/>
										</a>
									</Tooltipped>
								)}{' '}
								{oracle.name}
							</Col>
							{[oracle.id, oracle.creator].map((addr) => (
								<Col key={addr}>
									<a
										href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${addr}`}
										target="_blank"
									>
										{formatAddress(addr)}{' '}
										<FontAwesomeIcon icon="external-link-alt" />
									</a>
								</Col>
							))}
							<Col>{oracle.aggregators.length}</Col>
							<Col>
								{oracleValues ? (
									`${
										oracleValues[oracle.id]
											? getDisplayBalance(oracleValues[oracle.id])
											: '~'
									}`
								) : (
									<SpinnerLoader />
								)}
							</Col>
						</Row>
					</StyledAccordionHeader>
					<StyledAccordionBody>
						<h3>Equation & Variables</h3>
						<MathComponent tex={latexEq.output} />
						<br />
						<StatBlock
							label={undefined}
							stats={Object.keys(latexEq.variables).map((key) => ({
								label: key,
								value: (
									<a
										href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${latexEq.variables[key]}`}
										target="_blank"
									>
										{latexEq.variables[key]}{' '}
										<FontAwesomeIcon icon="external-link-alt" />
									</a>
								),
							}))}
						/>
						<br />
						{timeseriesData ? (
							<>
								<h3>
									<Tooltipped content="Timeseries data is updated every 300 blocks, or roughly every 1 hour assuming block time is ~12 seconds. This chart will only show 90 days of data at maximum." />{' '}
									Timeseries
								</h3>
								<ParentSize>
									{(parent) => (
										<AreaGraph
											width={parent.width}
											height={300}
											timeseries={timeseriesData}
										/>
									)}
								</ParentSize>
							</>
						) : (
							<h3 style={{ textAlign: 'center' }}>
								{dataExists ? (
									<SpinnerLoader block />
								) : (
									<i>
										<FontAwesomeIcon icon="exclamation-triangle" /> No
										timeseries data available. The oracle must be live for at
										least 2 days.
									</i>
								)}
							</h3>
						)}
					</StyledAccordionBody>
				</StyledAccordionItem>
			</Accordion>
		)
	}

	return (
		<>
			{oracleValues ? (
				<>
					<OracleListHeader
						headers={[
							'Name',
							'Address',
							'Creator',
							'No. Aggregators',
							'Latest Result',
						]}
					/>
					{oracles.map((oracle: Oracle) => {
						return <OracleListItem oracle={oracle} key={oracle.id} />
					})}
				</>
			) : (
				<SpinnerLoader block />
			)}
		</>
	)
}

const StyledAccordionItem = styled(Accordion.Item)`
	background-color: transparent;
	border-color: transparent;
`

const StyledAccordionBody = styled(Accordion.Body)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;

	> div {
		border: 1px solid ${(props) => props.theme.color.primary[200]};
		border-radius: 8px;
		overflow: hidden;
	}
`

const StyledAccordionHeader = styled(Accordion.Header)`
	&:active {
		border-radius: 8px 8px 0px 0px;
	}

	img {
		height: 32px;
		margin-right: 0.75rem;
		vertical-align: middle;
	}

	> button {
		background-color: ${(props) => props.theme.color.primary[100]};
		color: ${(props) => props.theme.color.text[100]};
		padding: 1.25rem;
		border: ${(props) => props.theme.border.default};
		border-radius: 8px;

		&:hover,
		&:focus,
		&:active,
		&:not(.collapsed) {
			background-color: ${(props) => props.theme.color.primary[200]};
			color: ${(props) => props.theme.color.text[100]};
			border: ${(props) => props.theme.border.default};
			box-shadow: none;
			border-radius: 8px 8px 0px 0px;
		}

		&:not(.collapsed) {
			transition: none;

			&:focus,
			&:active {
				border-color: ${(props) => props.theme.color.primary[300]};
			}

			::after {
				background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
					props,
				) =>
					props.theme.color.text[100].replace(
						'#',
						'%23',
					)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
			}
		}

		::after {
			// don't turn arrow blue
			background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='${(
				props,
			) =>
				props.theme.color.text[100].replace(
					'#',
					'%23',
				)}'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
		}

		.row > .col {
			margin: auto 0;
			text-align: right;

			&:first-child {
				text-align: left;
			}

			&:last-child {
				margin-right: 25px;
			}
		}
	}
`

const OracleListHeaderCol = styled(Col)`
	text-align: right;

	&:first-child {
		text-align: left;
	}

	&:last-child {
		margin-right: 46px;
	}
`

export default OracleList
