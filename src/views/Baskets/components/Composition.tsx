import React, { useMemo, useState } from 'react'
import { StyledTable } from '../../../components/Table'
import Tooltipped from '../../../components/Tooltipped'
import { getDisplayBalance } from '../../../utils/numberFormat'
import { BigNumber } from 'bignumber.js'
import { SpinnerLoader } from '../../../components/Loader'
import { Progress } from '../../../components/ProgressBar'
import _ from 'lodash'
import { BasketComponent } from '../../../hooks/baskets/useComposition'
import { ParentSize } from '@visx/responsive'
import DonutGraph from '../../../components/Graphs/PieGraph'
import styled from 'styled-components'
import { Col, Row } from 'react-bootstrap'
import { Button } from '../../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { TableContainer } from 'components/Table'
import { AssetBadge, CompositionBadge } from 'components/Badge/Badge'

type CompositionProps = {
	composition: BasketComponent[]
}

type DisplayType = 'TABLE' | 'PIE'

const Composition: React.FC<CompositionProps> = ({ composition }) => {
	const [displayType, setDisplayType] = useState<DisplayType>('TABLE')

	const maxPercentage = useMemo(() => {
		if (!composition) return

		return _.max(composition.map((component) => component.percentage))
	}, [composition])

	return (
		<div style={{ padding: '0 0.75rem' }}>
			<Row style={{ marginBottom: '1em' }}>
				<Col lg={1}>
					<Button onClick={() => setDisplayType('TABLE')}>
						<FontAwesomeIcon icon="table" />
					</Button>
				</Col>
				<Col lg={1}>
					<Button onClick={() => setDisplayType('PIE')}>
						<FontAwesomeIcon icon="chart-pie" />
					</Button>
				</Col>
			</Row>

			{displayType === 'TABLE' ? (
				<TableContainer>
					<StyledTable bordered hover>
						<thead>
							<tr>
								<th>Token</th>
								<th>Allocation</th>
								<th className="price">Price</th>
								<th className="apy">APY</th>
								<th className="strategy">Strategy</th>
							</tr>
						</thead>
						<tbody>
							{(composition &&
								composition
									.sort((a, b) => (a.percentage < b.percentage ? 1 : -1))
									.map((component: any) => (
										<tr key={component.symbol}>
											<td width="15%">
												<Tooltipped content={component.symbol}>
													<img
														src={component.image}
														style={{ height: '32px' }}
														alt="component"
													/>
												</Tooltipped>
											</td>
											<td width="40%">
												<Progress
													width={(component.percentage / maxPercentage) * 100}
													label={`${getDisplayBalance(
														new BigNumber(component.percentage),
														0,
													)}%`}
													assetColor={component.color}
												/>
											</td>
											<td className="price" width="20%">
												$
												{getDisplayBalance(
													component.basePrice || component.price,
													0,
												)}
											</td>
											<td className="apy" width="10%">
												<CompositionBadge>
													{component.apy
														? `${component.apy.div(1e18).times(100).toFixed(2)}%`
														: '~'}
												</CompositionBadge>
											</td>
											<td className="strategy" width="15%">
												<CompositionBadge>
													{component.strategy || 'None'}
												</CompositionBadge>
											</td>
										</tr>
									))) || (
								<tr>
									{[15, 40, 20, 10, 15].map((pct) => (
										<td width={`${pct}%`} key={Math.random()}>
											<SpinnerLoader />
										</td>
									))}
								</tr>
							)}
						</tbody>
					</StyledTable>
				</TableContainer>
			) : (
				<GraphContainer>
					<Row style={{ height: '100%' }}>
						<Col lg={8}>
							{composition && (
								<ParentSize>
									{(parent) => (
										<DonutGraph
											width={parent.width}
											height={parent.height}
											composition={composition}
										/>
									)}
								</ParentSize>
							)}
						</Col>
						<Col lg={4} style={{ margin: 'auto' }}>
							<Row lg={2}>
								{composition &&
									composition.map((component) => (
										<Col key={component.symbol}>
											<AssetBadge color={component.color}>
												{component.symbol}
											</AssetBadge>
										</Col>
									))}
							</Row>
						</Col>
					</Row>
				</GraphContainer>
			)}
		</div>
	)
}

const GraphContainer = styled.div`
	height: 500px;
	border-radius: 8px;
	background-color: ${(props) => props.theme.color.primary[100]};
	border: ${(props) => props.theme.border.default};
`

export default Composition
