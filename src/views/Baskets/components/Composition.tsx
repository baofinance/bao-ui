import React, { useMemo } from 'react'
import { StyledTable } from '../../../components/Table'
import Tooltipped from '../../../components/Tooltipped'
import { getDisplayBalance } from '../../../utils/numberFormat'
import { BigNumber } from 'bignumber.js'
import { StyledBadge } from '../../../components/Badge'
import { SpinnerLoader } from '../../../components/Loader'
import { Progress } from '../../../components/ProgressBar'
import _ from 'lodash'
import { BasketComponent } from '../../../hooks/baskets/useComposition'

type CompositionProps = {
	composition: BasketComponent[]
}

const Composition: React.FC<CompositionProps> = ({ composition }) => {
	const maxPercentage = useMemo(() => {
		if (!composition) return

		return _.max(composition.map((component) => component.percentage))
	}, [composition])

	return (
		<div style={{ padding: '0 0.75rem' }}>
			<StyledTable bordered hover>
				<thead>
				<tr>
					<th>Token</th>
					<th>Allocation</th>
					<th>Price</th>
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
								<td width="50%">
									<Progress
										width={(component.percentage / maxPercentage) * 100}
										label={`${getDisplayBalance(
											new BigNumber(component.percentage),
											0,
										)}%`}
										assetColor={component.color}
									/>
								</td>
								<td width="20%">
									$
									{getDisplayBalance(component.basePrice || component.price, 0)}
								</td>
								<td className="strategy" width="15%">
									<StyledBadge>{component.strategy || 'None'}</StyledBadge>
								</td>
							</tr>
						))) || (
					<tr>
						{_.times(4, () => (
							<td width="25%">
								<SpinnerLoader />
							</td>
						))}
					</tr>
				)}
				</tbody>
			</StyledTable>
		</div>
	)
}

export default Composition
