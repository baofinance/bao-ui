/* eslint-disable react/no-unescaped-entities */
import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useDistributionInfo from '@/hooks/distribution/useDistributionInfo'
import useProofs from '@/hooks/distribution/useProofs'
import { LockInfo } from '@/hooks/vebao/useLockInfo'
import type { Baov2, VotingEscrow } from '@/typechain/index'
import { dateFromEpoch, getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import Link from 'next/link'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { useCallback, useState } from 'react'
import Modal from '@/components/Modal'

type ActionProps = {
	baoBalance?: BigNumber
	lockInfo?: LockInfo
}

const Actions = ({ baoBalance, lockInfo }: ActionProps) => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const [val, setVal] = useState('')
	const allowance = useAllowance(Config.contracts.Baov2[chainId].address, Config.contracts.votingEscrow[chainId].address)
	const { pendingTx, handleTx } = useTransactionHandler()

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

	const { data: block } = useQuery(['timestamp'], async () => {
		const block = await library?.getBlock()
		return block
	})

	const [showModal, setShowModal] = useState(false)
	const [seenModal, setSeenModal] = useState(false)

	const modalShow = () => {
		setShowModal(true)
	}
	const modalHide = () => {
		setSeenModal(true)
		setShowModal(false)
	}

	const dist = useDistributionInfo()
	const merkleLeaf = useProofs()
	const canStartDistribution = !!merkleLeaf && !!dist && dist.dateStarted.eq(0) && dist.dateEnded.eq(0)
	const canEndDistribution = !!merkleLeaf && !!dist && dist.dateStarted.gt(0) && dist.dateEnded.eq(0)
	//const distributionEnded = !!merkleLeaf && !!dist && dist.dateEnded.gt(0)

	const shouldBeWarned = (canStartDistribution || canEndDistribution) && !seenModal

	return (
		<div className='col-span-2 row-span-1 rounded border border-primary-300 bg-primary-100 p-4'>
			{(lockInfo && lockInfo.lockEnd.gt(block.timestamp)) || (lockInfo && lockInfo.lockEnd.mul(1000).lt(block.timestamp)) ? (
				<>
					<Typography variant='xl' className='mb-4 text-center font-bold'>
						Lock BAO for veBAO
					</Typography>
					<div className='flex flex-row gap-3'>
						<div className='flex w-full flex-col'>
							<div className='mb-1 flex w-full items-center gap-1'>
								<Typography variant='sm' className='text-text-200'>
									Bao Balance:
								</Typography>
								<Typography variant='sm'>{getDisplayBalance(baoBalance)}</Typography>
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
								<Typography variant='sm' className='text-text-200'>
									Lock Length
								</Typography>
							</div>
							<div className='px-2'>
								<Slider
									max={max}
									value={weeks}
									onChange={onSliderChange}
									className='mt-4'
									handleStyle={{
										backgroundColor: '#FFD84B',
										borderColor: '#FFD84B',
										boxShadow: 'none',
										opacity: 1,
									}}
									trackStyle={{
										backgroundColor: '#CC9902',
										borderColor: '#CC9902',
									}}
									railStyle={{
										backgroundColor: '#622a2a',
									}}
								/>
							</div>
							<Typography variant='sm' className='text-center'>
								Lock until {new Date(lockTime).toDateString()}
							</Typography>
						</div>
					</div>
					<div className='flex flex-col'>
						{isNaN(lockInfo && parseFloat(formatUnits(lockInfo.balance))) || (lockInfo && lockInfo.balance.lte(0)) ? (
							<div className='mt-3 flex flex-row gap-4'>
								{allowance && allowance.lte(0) ? (
									<>
										{pendingTx ? (
											<Button fullWidth disabled={true}>
												Approving BAO
											</Button>
										) : (
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
											>
												{shouldBeWarned ? 'Read Warning' : 'Approve BAO'}
											</Button>
										)}
									</>
								) : (
									<>
										{pendingTx ? (
											<Button fullWidth disabled={true}>
												{typeof pendingTx === 'string' ? (
													<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
														Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
													</Link>
												) : (
													'Pending Transaction'
												)}
											</Button>
										) : (
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
											>
												{shouldBeWarned ? 'Read Warning' : 'Create Lock'}
											</Button>
										)}
									</>
								)}
							</div>
						) : (
							<div className='flex w-full flex-row gap-4'>
								<div className='mt-3 grid w-full grid-cols-2 gap-2'>
									{pendingTx ? (
										<Button disabled={true}>
											{typeof pendingTx === 'string' ? (
												<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
													Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
												</Link>
											) : (
												'Pending Transaction'
											)}
										</Button>
									) : (
										<Button
											disabled={!val || !bao || !lockTime || isNaN(val as any) || parseFloat(val) > parseFloat(formatUnits(baoBalance))}
											onClick={async () => {
												const lockTx = votingEscrow.increase_amount(ethers.utils.parseEther(val.toString()))
												handleTx(
													lockTx,
													`veBAO: Increased lock by ${parseFloat(val).toFixed(4)} BAO until ${new Date(
														lockInfo.lockEnd.mul(1000).toNumber(),
													).toLocaleDateString()}`,
												)
											}}
										>
											Increase Amount
										</Button>
									)}
									{pendingTx ? (
										<Button fullWidth disabled={true}>
											{typeof pendingTx === 'string' ? (
												<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
													Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
												</Link>
											) : (
												'Pending Transaction'
											)}
										</Button>
									) : (
										<Button
											fullWidth
											disabled={!bao || !lockTime || lockTime <= currentLockEnd}
											onClick={async () => {
												const lockTx = votingEscrow.increase_unlock_time(getEpochSecondForDay(lockTime))
												handleTx(lockTx, `veBAO: Increased lock until ${lockTime.toLocaleDateString()}`)
											}}
										>
											Increase Lock Time
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				</>
			) : (
				<>
					<Card.Header>Your Lock Has Expired</Card.Header>
					<Card.Body className='flex h-full w-full items-center justify-center'>
						<Button
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
							<Typography variant='h2' className='mr-1 inline-block font-semibold'>
								Warning!
							</Typography>
							<Typography variant='xl' className='mb-5 font-semibold text-text-300'>
								Locked token migration available
							</Typography>
						</>
					}
				/>
				<Modal.Body>
					<Typography variant='base' className='mr-1 pt-5 leading-normal'>
						This account has a locked BAO distribution available to it! If you create a new lock instead of migrating your distribution to a
						locked balance, you will be unable to choose the 'migrate' option for its entire length (four years) and will only be able to
						'claim' or 'end' your token distribution.
						<br />
						<br />
						For this reason, we highly recommend that you start and migrate your distribution of BAO tokens rather than creating a new lock
						here. To re-iterate, you will have to wait the entire distribution period to lock your distribution as veBAO if you choose to
						manually make a new lock here instead of migrating your account's distribution.
						<br />
						<br />
						To take advantage of this, you should start your distribution and act on it over in the 'Locked BAO' section of the{' '}
						<Link href='/distribution/'>
							<a className='font-bold hover:text-text-400'>/distribution/</a>
						</Link>{' '}
						page.
					</Typography>
					<div className='flow-col my-5 flex items-center gap-3'>
						<Link className='w-full' href='/distribution'>
							<Button fullWidth>Go to distribution</Button>
						</Link>
						OR
						<Button fullWidth onClick={modalHide}>
							I understand the risk!
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	)
}

export default Actions
