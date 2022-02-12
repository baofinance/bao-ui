import BigNumber from 'bignumber.js'
import { Button } from 'components/Button'
import { BalanceInput } from 'components/Input'
import Label from 'components/Label'
import { PoolType } from 'contexts/Farms/types'
import useAllowance from 'hooks/base/useAllowance'
import useApprove from 'hooks/base/useApprove'
import useBao from 'hooks/base/useBao'
import useTokenBalance from 'hooks/base/useTokenBalance'
import useStake from 'hooks/farms/useStake'
import useStakedBalance from 'hooks/farms/useStakedBalance'
import useUnstake from 'hooks/farms/useUnstake'
import React, { useCallback, useMemo, useState } from 'react'
import { Card } from 'react-bootstrap'
import { useWallet } from 'use-wallet'
import { getContract } from 'utils/erc20'
import { getFullDisplayBalance } from 'utils/numberFormat'
import {
	AssetLabel,
	InputStack,
	LabelFlex,
	LabelStack,
	MaxLabel
} from 'views/Markets/components/styles'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import { FarmWithStakedValue } from './FarmList'
import { AccordionCard } from './styles'

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
			{operation === 'Unstake' ? (
				<Unstake
					pid={farm.pid}
					tokenName={farm.lpToken.toUpperCase()}
					max={stakedBalance}
					onConfirm={onUnstake}
				/>
			) : (
				<Stake
					lpContract={lpContract}
					lpTokenAddress={lpTokenAddress}
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
	lpTokenAddress: string
	pid: number
	max: BigNumber
	onConfirm: (amount: string) => void
	tokenName?: string
	poolType: PoolType
}

const Stake: React.FC<StakeProps> = ({
	lpContract,
	lpTokenAddress,
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

	const walletBalance = useTokenBalance(lpTokenAddress)

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
			<Card.Header>
				<Card.Title>
					<Label text={`Stake ${tokenName}`} />
				</Card.Title>
			</Card.Header>
			<Card.Body>
				<InputStack>
					<LabelFlex>
						<LabelStack>
							<MaxLabel>Available to deposit:</MaxLabel>
							<AssetLabel>{`${fullBalance} ${tokenName}`}</AssetLabel>
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
			<Card.Header>
				<Card.Title>
					<Label text={`Unstake ${tokenName}`} />
				</Card.Title>
			</Card.Header>
			<Card.Body>
				<InputStack>
					<LabelFlex>
						<LabelStack>
							<MaxLabel>Available to withdraw:</MaxLabel>
							<AssetLabel>{`${fullBalance} ${tokenName}`}</AssetLabel>
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
