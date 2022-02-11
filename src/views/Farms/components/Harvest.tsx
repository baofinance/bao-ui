import baoIcon from 'assets/img/logo.svg'
import { Button } from 'components/Button'
import Label from 'components/Label'
import { SpinnerLoader } from 'components/Loader'
import Tooltipped from 'components/Tooltipped'
import Value from 'components/Value'
import useBlockDiff from 'hooks/base/useBlockDiff'
import useEarnings from 'hooks/farms/useEarnings'
import useFees from 'hooks/farms/useFees'
import useLockedEarnings from 'hooks/farms/useLockedEarnings'
import useReward from 'hooks/farms/useReward'
import { useUserFarmInfo } from 'hooks/farms/useUserFarmInfo'
import React, { useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { getBalanceNumber } from 'utils/numberFormat'
import { AssetImage, AssetImageContainer } from './styles'
import { AccordionCard } from './styles'

interface HarvestProps {
	pid: number
	operation: string
}

export const Harvest: React.FC<HarvestProps> = ({ pid, operation }) => {
	return (
		<>
			{operation === 'Stake' ? (
				<Earnings pid={pid} />
			) : (
				<FeeWarning pid={pid} />
			)}
		</>
	)
}

interface EarningsProps {
	pid: number
}

const Earnings: React.FC<EarningsProps> = ({ pid }) => {
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
			<Card.Body>
				<Row>
					<Col style={{ textAlign: 'center' }}>
						<AssetImageContainer>
							<AssetImage src={baoIcon} />
						</AssetImageContainer>
						{' '}
						<AssetImageContainer>
							<Earned value={getBalanceNumber(earnings)} />
						</AssetImageContainer>
					</Col>
				</Row>
			</Card.Body>
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

interface FeeProps {
	pid: number
}

const FeeWarning: React.FC<FeeProps> = ({ pid }) => {
	const userInfo = useUserFarmInfo(pid)
	const blockDiff = useBlockDiff(userInfo)
	const fees = useFees(blockDiff)
	const lastInteraction =
		blockDiff &&
		new Date(new Date().getTime() - 1000 * (blockDiff * 3)).toLocaleString()

	return (
		<AccordionCard>
			<Card.Header>
				<Card.Title>
					<Label text="❗BE AWARE OF WITHDRAWAL FEES❗" /> <br />
					<Label
						text="Disclaimer - The first deposit activates and each withdraw
					resets the timer for penalities and fees, this is pool based."
					/>
				</Card.Title>
			</Card.Header>
			<Card.Body style={{ paddingTop: '0' }}>
				<Row>
					<Col>
						<p style={{ marginBottom: '0' }}>
							<b>Current Fee:</b> <br />
							<b>Last interaction:</b> <br />
							<b>Blocks passed:</b> <br />
							<b>Last withdraw block:</b>
						</p>
					</Col>
					<Col style={{ alignContent: 'flex-end', marginBottom: '0' }}>
						<p style={{ textAlign: 'right' }}>
							{fees ? `${(fees * 100).toFixed(2)}%` : <SpinnerLoader />}
							<br />
							{lastInteraction ? (
								lastInteraction.toString()
							) : (
								<SpinnerLoader />
							)}{' '}
							<Tooltipped
								content="This date is an estimation, it grows more innaccurate as time passes due to block times being inconsistent. Please use blocks as a metric in order to correctly determine your current withdraw fee."
								placement="right"
							/>
							<br />
							{blockDiff ? blockDiff : <SpinnerLoader />}
							<br />
							{userInfo ? (
								userInfo.lastWithdrawBlock === '0' ? (
									'Never Withdrawn'
								) : (
									userInfo.lastWithdrawBlock
								)
							) : (
								<SpinnerLoader />
							)}
							<br />
						</p>
					</Col>
				</Row>
			</Card.Body>
		</AccordionCard>
	)
}

const BaoEarnings = styled.div`
	margin: auto;
`

const Earned = styled(Value)`
	margin: 0 0 -${(props) => props.theme.spacing[3]}px -${(props) =>
			props.theme.spacing[3]}px;
	vertical-align: super;
`
