import Config from '@/bao/lib/config'
import { getCrvSupply, getVotingEscrowContract } from '@/bao/utils'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { StatCards } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import { useNextDistribution } from '@/hooks/vebao/useNextDistribution'
import { getDisplayBalance, getFullDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import { addYears, format } from 'date-fns'
import { BigNumber, ethers } from 'ethers'
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
	const { library, account } = useWeb3React()
	const lockInfo = useLockInfo()
	const [val, setVal] = useState('')
	const [calendarIsOpen, setCalendarIsOpen] = useState(false)
	const startDate =
		lockInfo && lockInfo.lockEnd.mul(1000).toNumber() >= new Date().setUTCHours(0, 0, 0, 0)
			? lockInfo && new Date(addDays(7, new Date(lockInfo.lockEnd.mul(1000).toNumber())))
			: new Date(addDays(7, new Date()))
	const [endDate, setEndDate] = useState(startDate)
	const crvAddress = Config.addressMap.CRV
	const crvBalance = useTokenBalance(crvAddress)
	const crvContract = bao && bao.getContract('crv')
	const votingEscrowContract = getVotingEscrowContract(bao)
	const nextFeeDistribution = useNextDistribution()
	const allowance = useAllowance(crvAddress, Config.contracts.votingEscrow[Config.networkId].address)
	const { pendingTx, handleTx } = useTransactionHandler()
	const length = endDate.setUTCHours(0, 0, 0, 0) + 604800000 - 86400000
	const [baoPrice, setBaoPrice] = useState<BigNumber | undefined>()
	const [totalSupply, setTotalSupply] = useState<BigNumber>()

	useEffect(() => {
		if (!bao) return
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd').then(async res => {
			setBaoPrice(BigNumber.from((await res.json())['curve-dao-token'].usd))
		})
	}, [bao, setBaoPrice])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(getFullDisplayBalance(crvBalance))
	}, [crvBalance, setVal])

	const handleSelectHalf = useCallback(() => {
		setVal(getFullDisplayBalance(BigNumber.from(crvBalance.div(2).toNumber())))
	}, [crvBalance])

	useEffect(() => {
		const fetchTotalSupply = async () => {
			const supply = await getCrvSupply(bao)
			setTotalSupply(supply)
		}

		if (bao) fetchTotalSupply()
	}, [bao, setTotalSupply])

	console.log(lockInfo && lockInfo.lockEnd.mul(1000).toNumber())
	console.log(new Date().setUTCHours(0, 0, 0, 0))
	console.log(startDate.setUTCHours(0, 0, 0, 0))
	console.log(length)
	console.log(lockInfo)

	return (
		<>
			<div className={`mx-auto my-4 ${isDesktop ? 'flex-flow flex gap-4' : 'flex flex-col gap-3'} justify-evenly`}>
				<StatCards
					stats={[
						{
							label: `BAO Balance`,
							value: (
								<Tooltipped content={`Your unlocked BAO balance.`}>
									<a>
										<Image src='/images/tokens/BAO.png' alt='BAO' width={24} height={24} className='mr-1 inline' />
										{account ? (window.screen.width > 1200 ? getDisplayBalance(crvBalance) : truncateNumber(crvBalance)) : '-'}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `BAO Locked`,
							value: <Typography>{getDisplayBalance(lockInfo && lockInfo.lockAmount)}</Typography>,
						},
						{
							label: `veBAO Balance`,
							value:
								account && !isNaN(lockInfo && lockInfo.balance.toNumber())
									? window.screen.width > 1200
										? getDisplayBalance(lockInfo && lockInfo.balance)
										: truncateNumber(lockInfo && lockInfo.balance)
									: '-',
						},
						{
							label: `Locked Until`,
							value: <Typography>{new Date(lockInfo && lockInfo.lockEnd.times(1000).toNumber()).toDateString()}</Typography>,
						},
					]}
				/>
			</div>
			<div className='flex flex-row'>
				<div className='flex basis-1/2 flex-col pr-1'>
					<Card>
						<Card.Header>Lock BAO for veBAO</Card.Header>
						<Card.Body>
							<Typography variant='p'>
								Lock your BAO for veBAO to participate in protocol governance, earn a share of protocol revenue, and boost your yields from
								providing liquidity.
							</Typography>
							<div className='flex flex-row gap-3'>
								<div className='flex w-3/5 flex-col'>
									<div className='mb-1 flex w-full items-center gap-1'>
										<Typography variant='sm' className='text-text-200'>
											Bao Balance:
										</Typography>
										<Typography variant='sm'>{getDisplayBalance(crvBalance).toString()}</Typography>
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
																addDays(7, new Date(lockInfo && lockInfo.lockEnd.times(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
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
																addMonths(1, new Date(lockInfo && lockInfo.lockEnd.times(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
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
																addMonths(3, new Date(lockInfo && lockInfo.lockEnd.times(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
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
																addMonths(6, new Date(lockInfo && lockInfo.lockEnd.times(1000).toNumber())).setUTCHours(0, 0, 0, 0) >
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
																addYears(new Date(lockInfo && lockInfo.lockEnd.times(1000).toNumber()), 1).setUTCHours(0, 0, 0, 0) >
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
								{isNaN(lockInfo && lockInfo.balance.toNumber()) || (lockInfo && lockInfo.balance.lte(0)) ? (
									<div className='mt-3 flex flex-row gap-4'>
										{allowance && !allowance.toNumber() ? (
											<>
												{pendingTx ? (
													<Button fullWidth disabled={true}>
														Approving CRV
													</Button>
												) : (
													<Button
														fullWidth
														disabled={crvBalance.lte(0)}
														onClick={async () => {
															const tx = crvContract.approve(
																votingEscrowContract.address,
																ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
																library.getSigner(),
															)
															handleTx(tx, `Approve CRV`)
														}}
													>
														Approve CRV
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
														disabled={!val || !bao || !endDate || isNaN(val as any) || parseFloat(val) > crvBalance.toNumber()}
														onClick={async () => {
															const lockTx = votingEscrowContract.create_lock(
																ethers.utils.parseEther(val.toString()),
																length.toString().slice(0, 10),
															)
															handleTx(lockTx, `Locked ${parseFloat(val).toFixed(4)} CRV until ${endDate.toLocaleDateString()}`)
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
													disabled={!val || !bao || !endDate || isNaN(val as any) || parseFloat(val) > crvBalance.toNumber()}
													onClick={async () => {
														const lockTx = votingEscrowContract.methods
															.increase_amount(ethers.utils.parseEther(val.toString()))
															.send({ from: account })

														handleTx(
															lockTx,
															`Increased lock by ${parseFloat(val).toFixed(4)} CRV until ${new Date(
																lockInfo.lockEnd.times(1000).toNumber(),
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
													disabled={!bao || !endDate || length <= (lockInfo && lockInfo.lockEnd.times(1000).toNumber())}
													onClick={async () => {
														const lockTx = votingEscrowContract.methods
															.increase_unlock_time(length.toString().slice(0, 10))
															.send({ from: account })

														handleTx(lockTx, `Increased lock until ${endDate.toLocaleDateString()}`)
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
					</Card>
				</div>

				<div className='flex basis-1/2 flex-col pl-3'>
					<Card>
						<Card.Header>veBAO Stats</Card.Header>
						<Card.Body>
							<div className='flex flex-col gap-2'>
								<div className='text-center'>
									<Typography variant='sm' className='text-center text-text-200'>
										Total BAO Supply
									</Typography>
									<Badge>{getDisplayBalance(totalSupply)}</Badge>
								</div>
								<div className='text-center'>
									<Typography variant='sm' className='text-center text-text-200'>
										Total BAO Locked
									</Typography>
									<Badge>{getDisplayBalance(lockInfo && lockInfo.totalSupply)}</Badge>
								</div>
								<div className='text-center'>
									<Typography variant='sm' className='text-center text-text-200'>
										Percentage of BAO Locked
									</Typography>
									<Badge>
										{getDisplayBalance(lockInfo && totalSupply && lockInfo.totalSupply.div(totalSupply).times(100).times(1e18))}%
									</Badge>
								</div>

								<div className='text-center'>
									<Typography variant='sm' className='text-center text-text-200'>
										Total veBAO
									</Typography>
									<Badge>{getDisplayBalance(lockInfo && lockInfo.supply)}</Badge>
								</div>
								<div className='text-center'>
									<Typography variant='sm' className='text-center text-text-200'>
										Average Lock Time
									</Typography>
									<Badge>-</Badge>
								</div>
								<div className='text-center'>
									<Typography variant='sm' className='text-center text-text-200'>
										BAO Price
									</Typography>
									<Badge>{baoPrice && baoPrice.toNumber()}</Badge>
								</div>
								<div className='text-center'>
									<Tooltipped content='DailyFees * 365 / (Total veBAO * BAO Price) * 100'>
										<a>
											<Typography variant='sm' className='text-center text-text-200'>
												veBAO Holder APY
											</Typography>
											<Badge>-</Badge>
										</a>
									</Tooltipped>
								</div>
								<div className='text-center'>
									<Tooltipped content='Rewards are distributed once every two (2) weeks.'>
										<a>
											<Typography variant='sm' className='text-center text-text-200'>
												Next Distribution
											</Typography>
											<Badge>
												{addDays(1, new Date(nextFeeDistribution && nextFeeDistribution.times(1e18).times(1000).toNumber())).toUTCString()}
											</Badge>
										</a>
									</Tooltipped>
								</div>
							</div>
						</Card.Body>
					</Card>
				</div>
			</div>
		</>
	)
}

export default Lock
