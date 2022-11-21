import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
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

type ActionProps = {
	baoBalance?: BigNumber
	lockInfo?: LockInfo
}

export const Actions = ({ baoBalance, lockInfo }: ActionProps) => {
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
												disabled={baoBalance.lte(0)}
												onClick={async () => {
													// TODO: give the user a notice that we're approving max uint and instruct them how to change this value.
													const approveTx = baoV2.approve(votingEscrow.address, ethers.constants.MaxUint256)
													handleTx(approveTx, `veBAO: Approve BAO`)
												}}
											>
												Approve BAO
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
												onClick={async () => {
													const lockTx = votingEscrow.create_lock(ethers.utils.parseEther(val.toString()), getEpochSecondForDay(lockTime))
													handleTx(lockTx, `veBAO: Locked ${parseFloat(val).toFixed(4)} BAO until ${lockTime.toLocaleDateString()}`)
												}}
											>
												Create Lock
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
											disabled={!bao || !lockTime || lockTime <= currentLockEnd || getEpochSecondForDay(lockTime) >= max}
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
		</div>
	)
}
