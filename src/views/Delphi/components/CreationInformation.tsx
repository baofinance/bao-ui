import { StatBlock } from '../../Markets/components/Stats'
import { getDisplayBalance } from '../../../utils/numberFormat'
import Tooltipped from '../../../components/Tooltipped'
import React from 'react'
import { CreationInfo } from '../types'

const CreationInformation: React.FC<{
	creationInfo: CreationInfo
	name: string
}> = ({ creationInfo, name }: { creationInfo: CreationInfo; name: string }) => {
	return (
		<>
			<h3>Creation Details</h3>
			{creationInfo && creationInfo.output ? (
				<StatBlock
					label={null}
					stats={[
						{
							label: 'Est. Creation Tx Fee',
							value: `${getDisplayBalance(creationInfo.txFee.toString())} ETH`,
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
							value: `${getDisplayBalance(creationInfo.output)}e18`,
						},
					]}
				/>
			) : (
				<>
					<i>
						Could not get creation info. There may be another oracle that
						performs the same operation, or your equation may be incomplete.
					</i>
					<br />
				</>
			)}
			<br />
		</>
	)
}

export default CreationInformation
