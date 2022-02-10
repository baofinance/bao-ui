import { provider } from 'web3-core'
import BigNumber from 'bignumber.js'
import { Button, NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import Label from 'components/Label'
import TokenInput from 'components/TokenInput'
import { PoolType } from 'contexts/Farms/types'
import useAllowance from 'hooks/base/useAllowance'
import useApprove from 'hooks/base/useApprove'
import useBao from 'hooks/base/useBao'
import useTokenBalance from 'hooks/base/useTokenBalance'
import React, { useCallback, useMemo, useState } from 'react'
import { Card } from 'react-bootstrap'
import { useWallet } from 'use-wallet'
import { getContract } from 'utils/erc20'
import { getFullDisplayBalance } from 'utils/numberFormat'
import {
	InputStack,
	LabelFlex,
	LabelStack,
	MaxLabel,
	AssetLabel,
} from 'views/Markets/components/styles'
import { Contract } from 'web3-eth-contract'
import { FarmWithStakedValue } from './FarmList'
import { AccordionCard } from './styles'
import useStakedBalance from 'hooks/farms/useStakedBalance'
import useStake from 'hooks/farms/useStake'
import useUnstake from 'hooks/farms/useUnstake'

interface FarmListItemProps {
	farm: FarmWithStakedValue
	operation: string
}

export const Staking: React.FC<FarmListItemProps> = ({ farm, operation }) => {
	const { account } = useWallet()
	const { pid } = farm
	const bao = useBao()
	const { ethereum } = useWallet()

	const lpTokenAddress = farm.lpTokenAddress

	const lpContract = useMemo(() => {
		return getContract(ethereum as provider, lpTokenAddress)
	}, [ethereum, lpTokenAddress])

	const tokenBalance = useTokenBalance(lpContract.options.address)
	const stakedBalance = useStakedBalance(pid)

	const { onStake } = useStake(pid)
	const { onUnstake } = useUnstake(pid)

	return (
		<>
			{operation === "Unstake" ? (
				<Unstake
					pid={farm.pid}
					tokenName={farm.lpToken.toUpperCase()}
					max={stakedBalance}
					onConfirm={onUnstake}
				/>
			) : (
				<Stake
					lpContract={lpContract}
					pid={farm.pid}
					tokenName={farm.lpToken.toUpperCase()}
					poolType={farm.poolType}
					max={tokenBalance}
					onConfirm={onStake}
				/>
			)}
		</>
	)
}

interface StakeProps {
	lpContract: Contract
	pid: number
	max: BigNumber
	onConfirm: (amount: string) => void
	tokenName?: string
	poolType: PoolType
}

const Stake: React.FC<StakeProps> = ({
	lpContract,
	pid,
	poolType,
	max,
	onConfirm,
	tokenName = '',
}) => {
	const [val, setVal] = useState('')
	const [pendingTx, setPendingTx] = useState(false)

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const walletBalance = parseInt(fullBalance)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

	const [requestedApproval, setRequestedApproval] = useState(false)

	const allowance = useAllowance(lpContract)
	const { onApprove } = useApprove(lpContract)

	const handleApprove = useCallback(async () => {
		try {
			setRequestedApproval(true)
			const txHash = await onApprove()
			// user rejected tx or didn't go thru
			if (!txHash) {
				setRequestedApproval(false)
			}
		} catch (e) {
			console.log(e)
		}
	}, [onApprove, setRequestedApproval])

	return (
		<AccordionCard>
			<Card.Body>
				<InputStack>
					<LabelFlex>
						<LabelStack>
							<MaxLabel>Available to deposit:</MaxLabel>
							<AssetLabel>
								{`${walletBalance.toFixed(4)} ${tokenName}`}
							</AssetLabel>
						</LabelStack>
					</LabelFlex>
					<BalanceInput
						onMaxClick={handleSelectMax}
						onChange={handleChange}
						value={val}
					/>
				</InputStack>
			</Card.Body>
			<Card.Footer>
				{!allowance.toNumber() ? (
					<Button
						disabled={requestedApproval}
						onClick={handleApprove}
						text={`Approve ${tokenName}`}
					/>
				) : (
					<>
						{poolType !== PoolType.ARCHIVED ? (
							<Button
								disabled={pendingTx}
								text={pendingTx ? 'Pending Confirmation' : 'Deposit'}
								onClick={async () => {
									setPendingTx(true)
									await onConfirm(val)
									setPendingTx(false)
								}}
							/>
						) : (
							<Button
								disabled={true}
								text={'Pool Archived'}
								onClick={async () => {
									setPendingTx(true)
									await onConfirm(val)
									setPendingTx(false)
								}}
							/>
						)}
					</>
				)}
			</Card.Footer>
		</AccordionCard>
	)
}

interface UnstakeProps {
	max: BigNumber
	onConfirm: (amount: string) => void
	tokenName?: string
	pid: number
}

const Unstake: React.FC<UnstakeProps> = ({
	onConfirm,
	max,
	tokenName = '',
	pid = null,
}) => {
	const [val, setVal] = useState('')
	const [pendingTx, setPendingTx] = useState(false)

	const stakedBalance = useStakedBalance(pid)

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

	return (
		<AccordionCard>
			<Card.Body>
				<InputStack>
					<LabelFlex>
						<LabelStack>
							<MaxLabel>Available to withdraw:</MaxLabel>
							<AssetLabel>
								{`${stakedBalance.toFixed(4)} ${tokenName}`}
							</AssetLabel>
						</LabelStack>
					</LabelFlex>
					<BalanceInput
						onMaxClick={handleSelectMax}
						onChange={handleChange}
						value={val}
					/>
				</InputStack>
			</Card.Body>
			<Card.Footer>
				<Button
					disabled={stakedBalance.eq(new BigNumber(0)) || pendingTx}
					text={pendingTx ? 'Pending Confirmation' : 'Withdraw'}
					onClick={async () => {
						setPendingTx(true)
						await onConfirm(val)
						setPendingTx(false)
					}}
				/>
			</Card.Footer>
		</AccordionCard>
	)
}
