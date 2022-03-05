import React, { useEffect, useState } from 'react'
import Multicall from '../../../utils/multicall'
import Config from '../../../bao/lib/config'
import useBao from '../../../hooks/base/useBao'
import useIsConnected from '../../../hooks/base/useIsConnected'
import BigNumber from 'bignumber.js'
import { getDisplayBalance } from '../../../utils/numberFormat'
import { SpinnerLoader } from '../../../components/Loader'
import { Accordion, Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { formatAddress } from '../../../utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const OracleList: React.FC<OracleListProps> = ({
	oracles,
}: OracleListProps) => {
	const bao = useBao()
	const isConnected = useIsConnected()

	// TODO- Move to hook
	const [oraclePrices, setOraclePrices] = useState<any | undefined>()
	useEffect(() => {
		if (!bao) return

		const callContext = Multicall.createCallContext(
			oracles.map((cur) => {
				return {
					ref: cur.id,
					contract: bao.getNewContract('delphiOracle.json', cur.id),
					calls: [{ method: 'getLatestValue' }],
				}
			}),
		)

		bao.multicall.call(callContext).then((_res) => {
			const res = Multicall.parseCallResults(_res)
			const prices = Object.keys(res).reduce((prev, cur) => {
				return {
					...prev,
					[cur]: new BigNumber(res[cur][0].values[0].hex),
				}
			}, {})
			setOraclePrices(prices)
		})
	}, [bao])

	const OracleListHeader: React.FC<OracleListHeaderProps> = ({
		headers,
	}: OracleListHeaderProps) => {
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

	const OracleListItem: React.FC<OracleListItemProps> = ({ oracle }) => {
		return (
			<Accordion>
				<StyledAccordionItem eventKey="0" style={{ padding: '12px' }}>
					<StyledAccordionHeader>
						<Row lg={7} style={{ width: '100%' }}>
							<Col>{oracle.name}</Col>
							<Col>
								<a
									href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${oracle.id}`}
								>
									{formatAddress(oracle.id)}{' '}
									<FontAwesomeIcon icon="external-link-alt" />
								</a>
							</Col>
							<Col>{oracle.aggregators.length}</Col>
							<Col>
								{isConnected && oraclePrices ? (
									`${getDisplayBalance(oraclePrices[oracle.id])}`
								) : (
									<SpinnerLoader />
								)}
							</Col>
						</Row>
					</StyledAccordionHeader>
					<StyledAccordionBody>
						<h1>TODO: Analytics, etc.</h1>
					</StyledAccordionBody>
				</StyledAccordionItem>
			</Accordion>
		)
	}

	return (
		<>
			<OracleListHeader
				headers={['Name', 'Address', 'No. Aggregators', 'Latest Result']}
			/>
			{oracles.map((oracle: Oracle) => {
				return <OracleListItem oracle={oracle} />
			})}
		</>
	)
}

type Oracle = {
	id: string
	factory: string
	name: string
	creator: string
	aggregators: string[]
	nodes: OracleNode[]
}

type OracleNode = {
	id: string
	oracle: string
	child0: number
	child1: number
	child2: number
	child3: number
	value: number
}

type OracleListProps = {
	oracles: Oracle[]
}

type OracleListHeaderProps = {
	headers: string[]
}

interface OracleListItemProps {
	oracle: Oracle
}

const StyledAccordionItem = styled(Accordion.Item)`
	background-color: transparent;
	border-color: transparent;
`

const StyledAccordionBody = styled(Accordion.Body)`
	background-color: ${(props) => props.theme.color.primary[100]};
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
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
