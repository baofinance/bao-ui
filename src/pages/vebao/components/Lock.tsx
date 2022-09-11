import Config from '@/bao/lib/config'
import { approve, getVotingEscrowContract } from '@/bao/utils'
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
import { decimate, getDisplayBalance, getFullDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { addYears, format } from 'date-fns'
import { ethers } from 'ethers'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
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
	const { account } = useWeb3React()
	const [val, setVal] = useState('')
	const [calendarIsOpen, setCalendarIsOpen] = useState(false)
	const [endDate, setEndDate] = useState(new Date())
	const crvBalance = useTokenBalance(Config.addressMap.CRV)
	const crvAddress = Config.addressMap.CRV
	const crvContract = bao && bao.getContract('crv')
	const votingEscrowContract = getVotingEscrowContract(bao)
	const allowance = useAllowance(crvAddress, Config.contracts.votingEscrow[Config.networkId].address)
	const { pendingTx, handleTx } = useTransactionHandler()
	const length = new BigNumber(endDate.getTime() / 1000)

	const lockInfo = useLockInfo()

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	return (
		<>
			<div className={`mx-auto my-4 ${isDesktop ? 'flex-flow flex gap-4' : 'flex flex-col gap-3'} justify-evenly`}>
				<StatCards
					stats={[
						{
							label: `Your BAO Balance`,
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
							label: `Your veBAO Balance`,
							value: (
								<Tooltipped content={`Your locked veBAO balance.`}>
									<a>
										<Image src='/images/tokens/BAO.png' alt='BAO' width={24} height={24} className='mr-1 inline' />
										{account
											? window.screen.width > 1200
												? getDisplayBalance(lockInfo && lockInfo.balance)
												: truncateNumber(lockInfo.balance)
											: '-'}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `Rewards APR`,
							value: (
								<Tooltipped content={`DailyFees * 365 / (Total veBAO * BAO Price) * 100`}>
									<a>-</a>
								</Tooltipped>
							),
						},
						{
							label: `Total Locked`,
							value: `$420.69M`,
						},
					]}
				/>
			</div>
			<div className='flex flex-row'>
				<div className='flex basis-3/4 flex-col pr-1'>
					<Card>
						<Card.Header>Lock BAO for veBAO</Card.Header>
						<Card.Body>
							<Typography variant='p'>
								Lock your BAO for veBAO to participate in protocol governance, earn a share of protocol revenue, and boost your yields from
								providing liquidity.
							</Typography>
							<div className='flex flex-row'>
								<div className='flex flex-col'>
									<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
										<Typography variant='sm' className='text-text-200'>
											Bao Balance:
										</Typography>
										<Typography variant='sm'>{getDisplayBalance(crvBalance).toString()}</Typography>
									</div>
									<Input
										onSelectMax={() => setVal(decimate(crvBalance).toString())}
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
								<div className='ml-3 flex flex-col'>
									<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
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
											minDate={new Date()}
											maxDate={new Date(addYears(new Date(), 4).getTime() - 86400000)}
											selected={endDate}
											nextMonthButtonLabel='>'
											previousMonthButtonLabel='<'
											popperClassName='react-datepicker-left'
											open={calendarIsOpen}
											onClickOutside={() => setCalendarIsOpen(false)}
											customInput={
												<button
													type='button'
													className='inline-flex h-12 rounded border-0 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
													onClick={() => setCalendarIsOpen(true)}
												>
													<div
														onClick={() => setCalendarIsOpen(true)}
														className='inline-flex h-12 w-28 items-center rounded-l bg-primary-400 px-3 py-2 text-start text-text-100 hover:bg-primary-300'
													>
														{format(new Date(endDate), 'MM dd yyyy')}
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
															size='sm'
															className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
															onClick={() => {
																setEndDate(addDays(7, new Date()))
																setCalendarIsOpen(false)
															}}
														>
															1W
														</Button>
														<Button
															size='sm'
															className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
															onClick={() => {
																setEndDate(addMonths(1, new Date()))
																setCalendarIsOpen(false)
															}}
														>
															1M
														</Button>
														<Button
															size='sm'
															className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
															onClick={() => {
																setEndDate(addMonths(3, new Date()))
																setCalendarIsOpen(false)
															}}
														>
															3M
														</Button>
														<Button
															size='sm'
															className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
															onClick={() => {
																setEndDate(addMonths(6, new Date()))
																setCalendarIsOpen(false)
															}}
														>
															6M
														</Button>
														<Button
															size='sm'
															className='h-[30px] w-[30px] !font-normal focus:outline-none focus:ring-2 focus:ring-text-400/50 focus:ring-offset-0'
															onClick={() => {
																setEndDate(addYears(new Date(), 1))
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
															4Y
														</Button>
													</div>
												</>
											)}
										/>
									</div>
								</div>
								<div className='ml-3 flex flex-col'>
									<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
										<Typography variant='sm' className='text-text-200'>
											Lock Length
										</Typography>
									</div>
									{allowance && !allowance.toNumber() ? (
										<>
											{pendingTx ? (
												<Button fullWidth disabled={true}>
													Approving CRV
												</Button>
											) : (
												<Button
													fullWidth
													onClick={async () => {
														handleTx(approve(crvContract, votingEscrowContract, account), `Approve CRV`)
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
														<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
															Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
														</Link>
													) : (
														'Pending Transaction'
													)}
												</Button>
											) : lockInfo && lockInfo.balance.toNumber() > 0 ? (
												length > lockInfo.lockEnd ? (
													<Button
														fullWidth
														disabled={
															!val ||
															!bao ||
															!endDate ||
															isNaN(val as any) ||
															parseFloat(val) > crvBalance.toNumber() ||
															length.lte(lockInfo.lockEnd.plus(86400).times(1000).toNumber())
														}
														onClick={async () => {
															const lockTx = votingEscrowContract.methods
																.increase_unlock_time(length.toString().slice(0, 10))
																.send({ from: account })

															handleTx(lockTx, `Increased lock until ${endDate.toLocaleDateString()}`)
														}}
													>
														Icrease Lock Time
													</Button>
												) : (
													<Button
														fullWidth
														disabled={!val || !bao || !endDate || isNaN(val as any) || parseFloat(val) > crvBalance.toNumber()}
														onClick={async () => {
															const lockTx = votingEscrowContract.methods
																.increase_amount(ethers.utils.parseUnits(val.toString(), 18))
																.send({ from: account })

															handleTx(
																lockTx,
																`Increased lock by ${parseFloat(val).toFixed(4)} CRV until ${new Date(
																	lockInfo.lockEnd.plus(86400).times(1000).toNumber(),
																).toLocaleDateString()}`,
															)
														}}
													>
														Increase Amount
													</Button>
												)
											) : (
												<Button
													fullWidth
													disabled={!val || !bao || !endDate || isNaN(val as any) || parseFloat(val) > crvBalance.toNumber()}
													onClick={async () => {
														const lockTx = votingEscrowContract.methods
															.create_lock(ethers.utils.parseUnits(val.toString(), 18), length.toString().slice(0, 10))
															.send({ from: account })

														handleTx(lockTx, `Locked ${parseFloat(val).toFixed(4)} CRV until ${endDate.toLocaleDateString()}`)
													}}
												>
													Create Lock
												</Button>
											)}
										</>
									)}
								</div>
							</div>
						</Card.Body>
					</Card>
				</div>

				<div className='flex basis-1/4 flex-col pl-3'>
					<Card>
						<Card.Header>veBAO Rewards</Card.Header>
						<Card.Body>
							<div className='text-center'>
								<Typography variant='sm' className='text-center text-text-200'>
									veBAO Holder APY:
								</Typography>
								<Tooltipped content={`WeeklyFees * 365 / (Total veBAO * BAO Price) * 100`}>
									<a>
										<Badge>-</Badge>
									</a>
								</Tooltipped>
							</div>
							<div className='text-center'>
								<Typography variant='sm' className='text-center text-text-200'>
									BAO Price:
								</Typography>
								<Tooltipped content={`WeeklyFees * 365 / (Total veBAO * BAO Price) * 100`}>
									<a>
										<Badge>-</Badge>
									</a>
								</Tooltipped>
							</div>
						</Card.Body>
					</Card>
				</div>
			</div>
		</>
	)
}

export default Lock
