import React from 'react'

import { Badge } from 'react-bootstrap'
import { StatBlock } from '../../Markets/components/Stats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const GuideCollapse: React.FC = () => {
	return (
		<>
			<h4>Conventions</h4>
			<ul>
				<li>
					All aggregator results are standardized to 18 decimals (1e18) for
					equation simplicity.
				</li>
				<li>Oracle results should be 18 decimals (1e18).</li>
			</ul>
			<h4>Math & Syntax tips</h4>
			<ul>
				<li>
					To retain precision when multiplying two 18 decimal numbers together,
					use the percent operator <Badge bg="warning">x % y</Badge>. The
					percent operator multiplies <Badge bg="warning">x * y</Badge> and
					divides the result by 1e18. If the numbers are not 18 decimals, make a
					new constant variable representing the precision and divide the result
					by it as such: <Badge bg="warning">(x * y) / z</Badge>. This also
					applies when you raise a number to any power ∉{' '}
					{'{-1, -1/ℝ, 0, 1/ℝ, 1}'}:{' '}
					<Badge bg="warning">
						<FontAwesomeIcon icon="check-circle" /> (x ^ y) / z
					</Badge>
					{' vs '}
					<Badge bg="warning">
						<FontAwesomeIcon icon="times-circle" /> (x ^ y)
					</Badge>
				</li>
				<li>
					To retain precision when dividing two equal precision numbers,
					multiply the result by the divisor & dividend's precision. (ex.{' '}
					<Badge bg="warning">(x / y) * z</Badge> , where x & y are two 18
					decimal numbers and z=1e18)
				</li>
				<li>
					<i>Boolean logic coming soon</i>
				</li>
			</ul>
			<h4>Tips on saving gas</h4>
			<ul>
				<li>
					The more complex your equation is, the more it will cost to deploy
					your oracle. This is because the equation is kept in the Oracle
					contract's storage, and storage on the EVM is expensive.
				</li>
				<li>
					Because your equation will be evaluated each time{' '}
					<Badge bg="warning">getLatestValue()</Badge> is called, it is
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
					When multiplying two aggregator results or 18 decimal numbers
					together, use the percent operator ( x%y ) to retain precision instead
					of using an extra variable ( (x*y)/z ) to reduce the amount of nodes
					that exist in your oracle's equation tree.
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
						value:
							'True if the value on the left of the operator equals the right value, false if not',
					},
					{
						label: '!= (Inequality)',
						value:
							'True if the value on the left of the operator does not equal the right value, false if not',
					},
					{
						label: '> (Greater than)',
						value:
							'True if the value on the left of the operator is greater than the right value, false if not',
					},
					{
						label: '>= (Greater than or equal to)',
						value:
							'True if the value on the left of the operator is greater than or equal to than the value on the right, false if not',
					},
					{
						label: '< (Less than)',
						value:
							'True if the value on the left of the operator is less than the right value, false if not',
					},
					{
						label: '<= (Less than or equal to)',
						value:
							'True if the value on the left of the operator is less than or equal to than the value on the right, false if not',
					},
					{
						label: '&& (Boolean And Condition)',
						value:
							'True if the value on the left of the operator AND the value on the right are true, false if not',
					},
					{
						label: '|| (Boolean Or Condition)',
						value:
							'True if the value on the left of the operator OR the value on the right are true, false if not',
					},
					{
						label: '?: (Ternary)',
						value:
							'If the expression before the ? is true, return the expression before the colon. If not, evaluate the expression after the colon.',
					},
				]}
			/>
		</>
	)
}

export default GuideCollapse
