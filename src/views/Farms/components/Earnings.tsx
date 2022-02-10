import baoIcon from 'assets/img/logo.svg'
import { Button } from 'components/Button'
import Label from 'components/Label'
import Value from 'components/Value'
import useEarnings from 'hooks/farms/useEarnings'
import useLockedEarnings from 'hooks/farms/useLockedEarnings'
import useReward from 'hooks/farms/useReward'
import React, { useState } from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { getBalanceNumber } from 'utils/numberFormat'
import {
	AssetImage,
	AssetImageContainer,
} from './styles'
import { AccordionCard } from './styles'

interface HarvestProps {
	pid: number
}

const Earnings: React.FC<HarvestProps> = ({ pid }) => {
	const earnings = useEarnings(pid)
	const locks = useLockedEarnings()
	const [pendingTx, setPendingTx] = useState(false)
	const { onReward } = useReward(pid)

	return (
		<AccordionCard>
			<Card.Header>
				<Card.Title>
					<Label text="BAO Earned" />
				</Card.Title>
			</Card.Header>
			<BaoEarnings>
				<Row>
					<Col>
						<AssetImageContainer>
							<AssetImage src={baoIcon} />
						</AssetImageContainer>
					</Col>
					<Col>
						<AssetImageContainer>
							<Earned value={getBalanceNumber(earnings)} />
						</AssetImageContainer>
					</Col>
				</Row>
			</BaoEarnings>
			<Card.Footer>
				<Button
					disabled={!earnings.toNumber() || pendingTx}
					text={pendingTx ? 'Collecting BAO' : 'Harvest'}
					onClick={async () => {
						setPendingTx(true)
						await onReward()
						setPendingTx(false)
					}}
				/>
			</Card.Footer>
		</AccordionCard>
	)
}

export default Earnings

const BaoEarnings = styled.div`
	margin: auto;
`

const Earned = styled(Value)`
	margin: 0 0 -${(props) => props.theme.spacing[3]}px -${(props) =>
			props.theme.spacing[3]}px;
	vertical-align: super;
`
