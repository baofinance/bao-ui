import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useClaimableFees from '@/hooks/vebao/useClaimableFees'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import { useNextDistribution } from '@/hooks/vebao/useNextDistribution'
import type { Baov2, FeeDistributor, VotingEscrow } from '@/typechain/index'
import GraphUtil from '@/utils/graph'
import { decimate, exponentiate, fromDecimal, getDisplayBalance, getFullDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { addYears, format } from 'date-fns'
import { BigNumber, ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { isDesktop } from 'react-device-detect'

function addDays(numOfDays: number, date = new Date()) {
	date.setDate(date.getDate() + numOfDays)

	return date
}

function addMonths(numOfMonths: number, date = new Date()) {
	date.setMonth(date.getMonth() + numOfMonths)

	return date
}

const Lock: React.FC = () => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const lockInfo = useLockInfo()
	const [val, setVal] = useState('')
	const [calendarIsOpen, setCalendarIsOpen] = useState(false)
	const startDate =
		lockInfo && lockInfo.lockEnd.mul(1000).toNumber() >= new Date().setUTCHours(0, 0, 0, 0)
			? lockInfo && new Date(addDays(7, new Date(lockInfo.lockEnd.mul(1000).toNumber())))
			: new Date(addDays(7, new Date()))
	const [endDate, setEndDate] = useState(startDate)
	const baoAddress = Config.contracts.Baov2[chainId].address
	const baoBalance = useTokenBalance(baoAddress)
	const nextFeeDistribution = useNextDistribution()
	const allowance = useAllowance(baoAddress, Config.contracts.votingEscrow[chainId].address)
	const { pendingTx, handleTx } = useTransactionHandler()
	const length = endDate.setUTCHours(0, 0, 0, 0) + 604800000 - 86400000
	// FIXME: change this to be the 'bao-finance' token once we launch the new version.
	const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0))
	const claimableFees = useClaimableFees()

	const baoV2 = useContract<Baov2>('Baov2', baoAddress)
	const votingEscrow = useContract<VotingEscrow>('VotingEscrow', Config.contracts.votingEscrow[chainId].address)
	const feeDistributor = useContract<FeeDistributor>('FeeDistributor', Config.contracts.FeeDistributor[chainId].address)

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

	useEffect(() => {
		const fetchTotalSupply = async () => {
			const supply = await baoV2.totalSupply()
			setTotalSupply(supply)
		}
		if (baoV2) fetchTotalSupply()
	}, [baoV2, setTotalSupply])

	let suppliedPercentage
	if (lockInfo && totalSupply && totalSupply.gt(0)) {
		const lockSupplyPercent = exponentiate(lockInfo.totalSupply.mul(100))
		suppliedPercentage = lockSupplyPercent.div(totalSupply)
	}

	const { data: baoPrice } = useQuery(
		['GraphUtil.getPriceFromPair', { WETH: true, BAO: true }],
		async () => {
			const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
			const _baoPrice = await GraphUtil.getPriceFromPair(wethPrice, Config.contracts.Bao[chainId].address)
			return fromDecimal(_baoPrice)
		},
		{
			enabled: !!chainId,
			refetchOnReconnect: true,
			refetchInterval: 1000 * 60 * 5,
			placeholderData: BigNumber.from(0),
		},
	)

	const { data: block } = useQuery(['timestamp'], async () => {
		const block = await library?.getBlock()
		return block
	})

	const ratio = lockInfo ? parseFloat(formatUnits(lockInfo.supply)) / parseFloat(formatUnits(lockInfo.totalSupply)) : 0
	const avgLock = lockInfo ? Math.round(ratio * 4 * 100) / 100 : 0

	console.log('avgLock', avgLock)
	console.log(suppliedPercentage ? suppliedPercentage.toString() : 0)

	return (
		<>
			<div className='grid grid-cols-4 gap-4'>
				<div className='col-span-3 row-span-1 rounded border border-primary-300 bg-primary-100 p-4'>
					{lockInfo && lockInfo.lockEnd.gt(block.timestamp) ? (
						<>
							<Card.Header>Lock BAO for veBAO</Card.Header>
							<Card.Body>
								<Typography variant='p'>
									Lock your BAO for veBAO to participate in protocol governance, earn a share of protocol revenue, and boost your yields
									from providing liquidity.
								</Typography>
								<div className='flex flex-row gap-3'>
									<div className='flex w-3/5 flex-col'>
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
									</div>
									<div className='flex w-2/5 flex-col'>
										<div className='float-left mb-1 flex w-full items-center gap-1'>
											<Typography variant='sm' className='text-text-200'>
												Lock Length
											</Typography>
										</div>

										<div className='relative'>
											<DatePicker
												onChange={(date: Date) => {
													setEndDate(date)
													setCalendarIsOpen(false)
												}}
												minDate={new Date(startDate.setUTCHours(0, 0, 0, 0))}
												maxDate={new Date(addYears(new Date(), 4).setUTCHours(0, 0, 0, 0))}
												selected={startDate > endDate ? startDate : endDate}
												nextMonthButtonLabel='>'
												previousMonthButtonLabel='<'
												popperClassName='react-datepicker-left'
												open={calendarIsOpen}
												onClickOutside={() => setCalendarIsOpen(false)}
												customInput={
													<button
														type='button'
														className='inline-flex h-12 w-full rounded border-0 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
														onClick={() => setCalendarIsOpen(true)}
													>
														<div
															onClick={() => setCalendarIsOpen(true)}
															className='inline-flex h-12 w-full items-center rounded-l bg-primary-400 px-3 py-2 text-start text-text-100 hover:bg-primary-300'
														>
															{format(new Date(endDate > startDate ? endDate : startDate), 'MM dd yyyy')}
														</div>
														<div
															onClick={() => setCalendarIsOpen(true)}
															className='inline-flex h-12 items-center rounded-r bg-primary-200 px-3 py-2 text-center text-text-100'
														>
															<CalendarIcon className='ml-1 -mt-1 h-5 w-5' />
														</div>
													</button>
												}
												renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
													<>
														<div className='flex items-center justify-between px-2 py-2'>
															<span className='text-lg text-text-100'>{format(date, 'MMMM yyyy')}</span>

															<div className='space-x-2'>
																<button
																	onClick={decreaseMonth}
																	disabled={prevMonthButtonDisabled}
																	type='button'
																	className={`
                                            ${prevMonthButtonDisabled && 'cursor-not-allowed opacity-50'}
                                            inline-flex rounded border border-primary-300 bg-primary-200 p-1 text-sm font-medium shadow-sm hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0
                                        `}
																>
																	<ChevronLeftIcon className='h-5 w-5 text-text-100' />
																</button>

																<button
																	onClick={increaseMonth}
																	disabled={nextMonthButtonDisabled}
																	type='button'
																	className={`
                                            ${nextMonthButtonDisabled && 'cursor-not-allowed opacity-50'}
                                            inline-flex rounded border border-primary-300 bg-primary-200 p-1 text-sm font-medium shadow-sm hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0
                                        `}
																>
																	<ChevronRightIcon className='h-5 w-5 text-text-100' />
																</button>
															</div>
														</div>
														<div className='grid w-full grid-flow-row grid-cols-6 content-evenly items-center justify-evenly justify-items-center'>
															<Button
																disabled={
																	addDays(7, new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
																	addYears(new Date(), 4).setUTCHours(0, 0, 0, 0)
																}
																size='sm'
																className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
																onClick={() => {
																	setEndDate(addDays(7, new Date(startDate)))
																	setCalendarIsOpen(false)
																}}
															>
																1W
															</Button>
															<Button
																disabled={
																	addMonths(1, new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
																	addYears(new Date(), 4).setUTCHours(0, 0, 0, 0)
																}
																size='sm'
																className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
																onClick={() => {
																	setEndDate(addMonths(1, new Date(startDate.setUTCHours(0, 0, 0, 0) - 86400000 * 6)))
																	setCalendarIsOpen(false)
																}}
															>
																1M
															</Button>
															<Button
																disabled={
																	addMonths(3, new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
																	addYears(new Date(), 4).setUTCHours(0, 0, 0, 0)
																}
																size='sm'
																className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
																onClick={() => {
																	setEndDate(addMonths(3, new Date(startDate.setUTCHours(0, 0, 0, 0) - 86400000 * 5)))
																	setCalendarIsOpen(false)
																}}
															>
																3M
															</Button>
															<Button
																disabled={
																	addMonths(6, new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
																	addYears(new Date(), 4).setUTCHours(0, 0, 0, 0)
																}
																size='sm'
																className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
																onClick={() => {
																	setEndDate(addMonths(6, new Date(startDate.setUTCHours(0, 0, 0, 0) - 86400000 * 2)))
																	setCalendarIsOpen(false)
																}}
															>
																6M
															</Button>
															<Button
																disabled={
																	addYears(new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber()), 1).setUTCHours(0, 0, 0, 0) >
																	addYears(new Date(), 4).setUTCHours(0, 0, 0, 0)
																}
																size='sm'
																className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
																onClick={() => {
																	setEndDate(new Date(addYears(new Date(startDate.setUTCHours(0, 0, 0, 0) - 604800000), 1)))
																	setCalendarIsOpen(false)
																}}
															>
																1Y
															</Button>
															<Button
																size='sm'
																className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
																onClick={() => {
																	setEndDate(addYears(new Date(), 4))
																	setCalendarIsOpen(false)
																}}
															>
																MAX
															</Button>
														</div>
													</>
												)}
											/>
										</div>
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
																<Link
																	href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`}
																	target='_blank'
																	rel='noopener noreferrer'
																>
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
																const lockTx = votingEscrow.create_lock(
																	ethers.utils.parseEther(val.toString()),
																	length.toString().slice(0, 10),
																)
																handleTx(lockTx, `veBAO: Locked ${parseFloat(val).toFixed(4)} BAO until ${endDate.toLocaleDateString()}`)
															}}
														>
															Create Lock
														</Button>
													)}
												</>
											)}
										</div>
									) : (
										<div className='flex flex-row gap-4'>
											<div className='mt-3 flex w-3/5 flex-col'>
												{pendingTx ? (
													<Button fullWidth disabled={true}>
														{typeof pendingTx === 'string' ? (
															<Link
																href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`}
																target='_blank'
																rel='noopener noreferrer'
															>
																Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
															</Link>
														) : (
															'Pending Transaction'
														)}
													</Button>
												) : (
													<Button
														fullWidth
														disabled={
															!val || !bao || !endDate || isNaN(val as any) || parseFloat(val) > parseFloat(formatUnits(baoBalance))
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
													>
														Increase Amount
													</Button>
												)}
											</div>

											<div className='mt-3 flex w-2/5 flex-col'>
												{pendingTx ? (
													<Button fullWidth disabled={true}>
														{typeof pendingTx === 'string' ? (
															<Link
																href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`}
																target='_blank'
																rel='noopener noreferrer'
															>
																Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
															</Link>
														) : (
															'Pending Transaction'
														)}
													</Button>
												) : (
													<Button
														fullWidth
														disabled={!bao || !endDate || length <= (lockInfo && lockInfo.lockEnd.mul(1000).toNumber())}
														onClick={async () => {
															const lockTx = votingEscrow.increase_unlock_time(length.toString().slice(0, 10))
															handleTx(lockTx, `veBAO: Increased lock until ${endDate.toLocaleDateString()}`)
														}}
													>
														Increase Lock Time
													</Button>
												)}
											</div>
										</div>
									)}
								</div>
							</Card.Body>
						</>
					) : (
						<>
							<Card.Header>Your Lock Has Expired</Card.Header>
							<Card.Body>
								<Button
									fullWidth
									onClick={async () => {
										const lockTx = votingEscrow.withdraw()
										handleTx(lockTx, `veBAO: Unstaked ${getDisplayBalance(lockInfo.lockAmount)} BAO`)
									}}
								>
									Unstake BAO
								</Button>
							</Card.Body>
						</>
					)}
				</div>

				<div>
					<div className='grid h-full grid-rows-6 items-center justify-end rounded border border-primary-300 bg-primary-100 p-4'>
						<Typography className='mb-4 text-center font-bold'>veBAO Stats</Typography>
						<div className='grid grid-cols-2 items-center gap-1'>
							<Typography variant='sm' className='text-text-200'>
								Earned Rewards
							</Typography>
							<div className='flex justify-end'>
								<>
									<div className='-mr-1 flex h-8 items-center justify-center rounded-l bg-primary-400'>
										<Typography variant='sm' className='ml-2 inline font-semibold'>
											{account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}
										</Typography>
										<Image src='/images/tokens/baoUSD.png' alt='BAO' width={16} height={16} className='ml-1 mr-2 inline' />
									</div>
								</>
								<>
									{pendingTx ? (
										<Button size='xs' className='rounded-l-none border-0' disabled={true}>
											Claim
										</Button>
									) : (
										<Button
											size='xs'
											onClick={async () => {
												const harvestTx = feeDistributor['claim(address)'](account)
												handleTx(harvestTx, `veBAO: Claim ${getDisplayBalance(claimableFees)} baoUSD`)
											}}
											className='rounded-l-none border-0'
										>
											Claim
										</Button>
									)}
								</>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-1'>
							<Typography variant='sm' className='text-text-200'>
								BAO Balance
							</Typography>
							<>
								<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
									{account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}
								</Typography>
							</>
						</div>
						<div className='grid grid-cols-2 gap-1'>
							<Typography variant='sm' className='text-text-200'>
								BAO Locked
							</Typography>
							<>
								<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
									<>{lockInfo && getDisplayBalance(lockInfo.lockAmount)}</>
								</Typography>
							</>
						</div>
						<div className='grid grid-cols-2 gap-1'>
							<Typography variant='sm' className='text-text-200'>
								veBAO Balance
							</Typography>
							<>
								<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
									{account && !isNaN(lockInfo && parseFloat(formatUnits(lockInfo.balance)))
										? window.screen.width > 1200
											? getDisplayBalance(lockInfo && lockInfo.balance)
											: truncateNumber(lockInfo && lockInfo.balance)
										: '-'}
								</Typography>
							</>
						</div>
						<div className='grid grid-cols-2 gap-1'>
							<Typography variant='sm' className='text-text-200'>
								Locked Until
							</Typography>
							<>
								<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
									{new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber()).toDateString()}{' '}
								</Typography>
							</>
						</div>
					</div>
				</div>
			</div>

			<Typography variant='xl' className='mt-4 font-bold'>
				Protocol Statistics
			</Typography>
			<div
				className={`my-2 grid w-full grid-flow-col ${
					isDesktop ? 'grid-rows-1 gap-4' : 'grid-rows-2 gap-2'
				} justify-evenly rounded border border-primary-300 bg-primary-100 bg-opacity-80 p-4`}
			>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Total Value Locked
						</Typography>
					</div>
					<Typography>
						<Typography variant='lg' className='font-bold'>
							${lockInfo && baoPrice ? getDisplayBalance(decimate(lockInfo.totalSupply.mul(baoPrice.mul(1000)))) : 0}
						</Typography>
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							veBAO APR
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						-
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Percentage of BAO Locked
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						{suppliedPercentage && `${getDisplayBalance(suppliedPercentage)}%`}
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Average Lock Time
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						{avgLock ? avgLock : 0} Years
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Next Distribution
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						{nextFeeDistribution && nextFeeDistribution.mul(1000).lte(block.timestamp)
							? addDays(1, new Date(nextFeeDistribution.mul(1000).toNumber())).toDateString()
							: `-`}
					</Typography>
				</div>
			</div>
		</>
	)
}

export default Lock
