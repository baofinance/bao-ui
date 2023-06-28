/* eslint-disable react/no-unescaped-entities */
import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import useDistributionInfo from '@/hooks/distribution/useDistributionInfo'
import useProofs from '@/hooks/distribution/useProofs'
import { LockInfo } from '@/hooks/vebao/useLockInfo'
import type { Baov2, VotingEscrow } from '@/typechain/index'
import { dateFromEpoch, getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import Link from 'next/link'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { useCallback, useState } from 'react'

type ActionProps = {
	baoBalance?: BigNumber
	lockInfo?: LockInfo
}

const Actions = ({ baoBalance, lockInfo }: ActionProps) => {
	const { library, chainId } = useWeb3React()
	const [val, setVal] = useState('')
	const allowance = useAllowance(Config.contracts.Baov2[chainId].address, Config.contracts.votingEscrow[chainId].address)
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const baoV2 = useContract<Baov2>('Baov2', Config.contracts.Baov2[chainId].address)
	const votingEscrow = useContract<VotingEscrow>('VotingEscrow', Config.contracts.votingEscrow[chainId].address)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(getFullDisplayBalance(baoBalance))
	}, [baoBalance, setVal])

	const handleSelectHalf = useCallback(() => {
		setVal(getFullDisplayBalance(baoBalance.div(2)))
	}, [baoBalance])

	const currentLockEnd = parseFloat(lockInfo?.lockEnd.toString()) ? dateFromEpoch(parseFloat(lockInfo?.lockEnd.toString())) : new Date()
	const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1))
	const max = getWeekDiff(currentLockEnd, getDayOffset(new Date(), 365 * 4 - 7))
	const [weeks, setWeeks] = useState<number>(max)

	const onSliderChange = (value: number | number[]) => {
		setWeeks(value as number)
		setLockTime(getDayOffset(currentLockEnd, (value as number) * 7))
	}

	const enabledTimestamp = !!library
	const { data: timestamp, refetch: refetchTimestamp } = useQuery(
		['library.getBlock().timestamp'],
		async () => {
			const block = await library.getBlock()
			return block.timestamp
		},
		{
			enabled: enabledTimestamp,
			placeholderData: 0,
		},
	)
	const _refetchTimestamp = () => {
		if (enabledTimestamp) refetchTimestamp()
	}
	useTxReceiptUpdater(_refetchTimestamp)
	useBlockUpdater(_refetchTimestamp, 10)

	const [showModal, setShowModal] = useState(false)
	const [seenModal, setSeenModal] = useState(false)

	const modalShow = () => {
		setShowModal(true)
	}
	const modalHide = () => {
		setSeenModal(true)
		setShowModal(false)
	}

	const merkleLeaf = useProofs()
	const dist = useDistributionInfo()
	const canStartDistribution = !!merkleLeaf && !!dist && dist.dateStarted.eq(0) && dist.dateEnded.eq(0)
	const canEndDistribution = !!merkleLeaf && !!dist && dist.dateStarted.gt(0) && dist.dateEnded.eq(0)

	const shouldBeWarned = canStartDistribution || canEndDistribution

	return (
		<div className='col-span-2 row-span-1'>
			{(lockInfo && lockInfo.lockEnd.gt(timestamp)) || (lockInfo && lockInfo.lockEnd.mul(1000).lt(timestamp)) ? (
				<>
					<Typography variant='xl' className='mb-4 text-center font-bakbak'>
						Lock BAO for veBAO
					</Typography>
					<div className='glassmorphic-card grid items-center rounded px-8 py-6'>
						<div className='flex flex-row gap-3'>
							<div className='flex w-full flex-col'>
								<div className='mb-1 flex w-full items-center gap-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Bao Balance:
									</Typography>
									<Typography variant='sm' className='font-bakbak'>
										{getDisplayBalance(baoBalance)}
									</Typography>
								</div>
								<Input
									onSelectMax={() => handleSelectMax()}
									onSelectHalf={() => handleSelectHalf()}
									onChange={handleChange}
									value={val}
									label={
										<div className='flex flex-row items-center pl-2 pr-3'>
											<div className='flex justify-center'>
												<Image src='/images/tokens/BAO.png' width={32} height={32} alt='BAO' className='block align-middle' />
											</div>
										</div>
									}
								/>
								<div className='float-left mt-2 flex w-full items-center gap-1'>
									<Typography className='mt-2 font-bakbak'>Lock Length</Typography>
								</div>
								<div className='px-2'>
									<Slider
										max={max}
										value={weeks}
										onChange={onSliderChange}
										className='mt-4'
										handleStyle={{
											backgroundColor: '#e21a53',
											borderColor: '#e21a53',
											boxShadow: 'none',
											opacity: 1,
										}}
										trackStyle={{
											backgroundColor: '#e21a53',
											borderColor: '#e21a53',
										}}
										railStyle={{
											backgroundColor: '#faf2e340',
										}}
									/>
								</div>
								<Typography variant='sm' className='text-center font-bakbak'>
									Lock until {new Date(lockTime).toDateString()}
								</Typography>
							</div>
						</div>
						<div className='flex flex-col'>
							{isNaN(lockInfo && parseFloat(formatUnits(lockInfo.balance))) || lockInfo.balance.lte(0) ? (
								<div className='mt-3 flex flex-row gap-4'>
									{allowance && allowance.lte(0) ? (
										<>
											<Button
												fullWidth
												disabled={baoBalance.lte(0) && !shouldBeWarned}
												onClick={async () => {
													if (shouldBeWarned) {
														modalShow()
													} else {
														// TODO: give the user a notice that we're approving max uint and instruct them how to change this value.
														const approveTx = baoV2.approve(votingEscrow.address, ethers.constants.MaxUint256)
														handleTx(approveTx, `veBAO: Approve BAO`)
													}
												}}
												pendingTx={pendingTx}
												txHash={txHash}
											>
												{shouldBeWarned ? 'Read Warning' : 'Approve BAO'}
											</Button>
										</>
									) : (
										<>
											<Button
												fullWidth
												disabled={baoBalance.lte(0) && !shouldBeWarned}
												onClick={async () => {
													if (shouldBeWarned) {
														modalShow()
													} else {
														const lockTx = votingEscrow.create_lock(ethers.utils.parseEther(val.toString()), getEpochSecondForDay(lockTime))
														handleTx(lockTx, `veBAO: Locked ${parseFloat(val).toFixed(4)} BAO until ${lockTime.toLocaleDateString()}`)
													}
												}}
												pendingTx={pendingTx}
												txHash={txHash}
											>
												{shouldBeWarned ? 'Read Warning' : 'Create Lock'}
											</Button>
										</>
									)}
								</div>
							) : (
								<div className='flex w-full flex-row gap-4'>
									<div className='mt-3 grid w-full gap-2 md:grid-cols-2'>
										{allowance && allowance.lte(0) ? (
											<>
												<Button
													fullWidth
													disabled={baoBalance.lte(0) && !shouldBeWarned}
													onClick={async () => {
														if (shouldBeWarned) {
															modalShow()
														} else {
															// TODO: give the user a notice that we're approving max uint and instruct them how to change this value.
															const approveTx = baoV2.approve(votingEscrow.address, ethers.constants.MaxUint256)
															handleTx(approveTx, `veBAO: Approve BAO`)
														}
													}}
													pendingTx={pendingTx}
													txHash={txHash}
												>
													{shouldBeWarned ? 'Read Warning' : 'Approve BAO'}
												</Button>
											</>
										) : (
											<Button
												fullWidth
												disabled={
													!val ||
													!lockTime ||
													isNaN(val as any) ||
													parseFloat(val) > parseFloat(formatUnits(baoBalance)) ||
													parseFloat(val) <= 0
												}
												onClick={async () => {
													const lockTx = votingEscrow.increase_amount(ethers.utils.parseEther(val.toString()))
													handleTx(
														lockTx,
														`veBAO: Increased lock by ${parseFloat(val).toFixed(4)} BAO until ${new Date(
															lockInfo.lockEnd.mul(1000).toNumber(),
														).toLocaleDateString()}`,
													)
												}}
												pendingTx={pendingTx}
												txHash={txHash}
											>
												Increase Amount
											</Button>
										)}
										<Button
											fullWidth
											disabled={!lockTime || lockTime <= currentLockEnd || max <= 0}
											onClick={async () => {
												const lockTx = votingEscrow.increase_unlock_time(getEpochSecondForDay(lockTime))
												handleTx(lockTx, `veBAO: Increased lock until ${lockTime.toLocaleDateString()}`)
											}}
											pendingTx={pendingTx}
											txHash={txHash}
										>
											Increase Lock Time
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</>
			) : (
				<>
					<Card.Header>Your Lock Has Expired</Card.Header>
					<Card.Body className='flex h-full w-full items-center justify-center'>
						<Button
							fullWidth
							onClick={async () => {
								const lockTx = votingEscrow.withdraw()
								handleTx(lockTx, `veBAO: Unstaked ${getDisplayBalance(lockInfo.lockAmount)} BAO`)
							}}
							className='-mt-8'
						>
							Unstake BAO
						</Button>
					</Card.Body>
				</>
			)}

			<Modal isOpen={showModal} onDismiss={modalHide}>
				<Modal.Header
					onClose={modalHide}
					header={
						<>
							<Typography variant='h2' className='inline-block font-bakbak text-red'>
								Warning!
							</Typography>
						</>
					}
				/>
				<Modal.Body>
					<Typography variant='xl' className='inline-block font-bakbak'>
						This account has a BAOv1 distribution!
					</Typography>
					<Typography variant='p' className='leading-normal'>
						We recommend starting and migrating your distribution of BAOv1 tokens rather than creating a new veBAO lock.
					</Typography>
					<Typography variant='p' className='leading-normal'>
						Users can only have one veBAO lock at a time. Although users can add to their veBAO lock, migrating a distribution can only
						create a new lock.
					</Typography>
					<Typography variant='p' className='leading-normal'>
						If you create a new veBAO lock, you will have to wait the entire distribution period (3 years), or until the lock expires, to
						migrate your distribution.
					</Typography>
					<div className='flow-col my-5 flex items-center gap-3'>
						<Link className='w-full' href='/distribution'>
							<Button fullWidth>Migrate to veBAO</Button>
						</Link>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	)
}

export default Actions
