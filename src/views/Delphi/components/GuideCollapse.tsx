import React from 'react'

import { Badge } from 'react-bootstrap'
import { StatBlock } from '../../Markets/components/Stats'

const GuideCollapse: React.FC = () => {
	return (
		<>
			<h4>Tips on saving gas:</h4>
			<ul>
				<li>
					The more complex your equation is, the more it will cost to deploy
					your oracle. This is because the equation is kept in the Oracle
					contract's storage, and storage on the EVM is expensive.
				</li>
				<li>
					Because your equation will be evaluated each time{' '}
					<Badge bg="secondary">getLatestValue()</Badge> is called, it is
					important to keep in mind that{' '}
					<b style={{ fontWeight: 'bold' }}>
						when the oracle is used by a protocol, the amount of aggregators and
						the complexity of your equation will directly affect how much a user
						pays for their transaction.
					</b>{' '}
					ChainLink aggregator results and extra equation tree nodes add up
					quickly!
				</li>
				<li>
					When multiplying two aggregator results or x*1e18 numbers together,
					use the percent operator ( x%y ) to reduce the amount of nodes that
					exist in your oracle's equation tree.
				</li>
			</ul>
			<StatBlock
				label="Available Operators"
				stats={[
					{
						label: '+ (Addition)',
						value: 'Adds the variables on the left and right of the operator',
					},
					{
						label: '- (Subtraction)',
						value:
							'Subtracts the variable on the right hand side of the operator from the variable on the left',
					},
					{
						label: '* (Multiply)',
						value:
							'Multiplies the variables on the left and right of the operator',
					},
					{
						label: '/ (Divide)',
						value:
							'Divides the variable on the left hand side of the operator by the variable on the right',
					},
					{
						label: '^ (Exponent)',
						value:
							'Raises the variable on the left hand side of the operator to the power of the variable on the right',
					},
					{
						label: '% (Percent)',
						value:
							'Multiplies the variables on the left and right of the operator and divides the result by 1e18',
					},
					{
						label: 'sqrt(x) (Square Root)',
						value: 'Coming soon!',
					},
					{
						label: '== (Equality)',
						value: 'Coming soon!',
					},
					{
						label: '!= (Inequality)',
						value: 'Coming soon!',
					},
					{
						label: '> (Greater than)',
						value: 'Coming soon!',
					},
					{
						label: '>= (Greater than or equal to)',
						value: 'Coming soon!',
					},
					{
						label: '< (Less than)',
						value: 'Coming soon!',
					},
					{
						label: '<= (Less than or equal to)',
						value: 'Coming soon!',
					},
					{
						label: '&& (Boolean And Condition)',
						value: 'Coming soon!',
					},
					{
						label: '|| (Boolean Or Condition)',
						value: 'Coming soon!',
					},
					{
						label: '?: (Ternary)',
						value: 'Coming soon!',
					},
				]}
			/>
		</>
	)
}

export default GuideCollapse
