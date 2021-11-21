import baoIcon from 'assets/img/bao.png'
import { Button } from 'components/Button'
import Card from 'components/Card'
import CardContent from 'components/CardContent'
import CardIcon from 'components/CardIcon'
import Label from 'components/Label'
import Spacer from 'components/Spacer'
import Value from 'components/Value'
import useEarnings from 'hooks/useEarnings'
import useLockedEarnings from 'hooks/useLockedEarnings'
import useReward from 'hooks/useReward'
import React, { useState } from 'react'
import { getBalanceNumber } from 'utils/numberFormat'
import {
	StyledCardActions,
	StyledCardContentInner,
	StyledCardHeader,
} from './styles'

interface HarvestProps {
	pid: number
}

const Harvest: React.FC<HarvestProps> = ({ pid }) => {
	const earnings = useEarnings(pid)
	const locks = useLockedEarnings()
	const [pendingTx, setPendingTx] = useState(false)
	const { onReward } = useReward(pid)

	return (
		<Card>
			<CardContent>
				<StyledCardContentInner>
					<StyledCardHeader>
						<CardIcon>
							<img src={baoIcon} height={50} alt="" />
						</CardIcon>
						<Value value={getBalanceNumber(earnings)} />
						<Label text="BAO Earned" />
					</StyledCardHeader>
					<Spacer />
					<StyledCardHeader>
						<Value value={getBalanceNumber(locks)} />
						<Label text="Locked BAO" />
						<Spacer />
					</StyledCardHeader>
					<StyledCardActions>
						<Button
							disabled={!earnings.toNumber() || pendingTx}
							text={pendingTx ? 'Collecting BAO' : 'Harvest'}
							onClick={async () => {
								setPendingTx(true)
								await onReward()
								setPendingTx(false)
							}}
						/>
					</StyledCardActions>
				</StyledCardContentInner>
			</CardContent>
		</Card>
	)
}

export default Harvest
