import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { StatCards } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useVotingPower from '@/hooks/vebao/useVotingPower'
import { decimate, getDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import { addYears, format } from 'date-fns'
import Image from 'next/future/image'
import React, { useState } from 'react'
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
	const [inputVal, setInputVal] = useState('')
	const [calendarIsOpen, setCalendarIsOpen] = useState(false)
	const [endDate, setEndDate] = useState(new Date())
	const baoBalance = useTokenBalance(Config.addressMap.CRV)
	const votingPower = useVotingPower()

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
										{account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}
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
										{account ? (window.screen.width > 1200 ? getDisplayBalance(votingPower) : truncateNumber(votingPower)) : '-'}
									</a>
								</Tooltipped>
							),
						},
						{
							label: `Rewards APR`,
							value: `69%`,
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
										<Typography variant='sm'>{getDisplayBalance(baoBalance).toString()}</Typography>
									</div>
									<Input
										onSelectMax={() => setInputVal(decimate(baoBalance).toString())}
										onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
										value={inputVal}
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
											maxDate={addYears(new Date(), 4)}
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
							</div>
						</Card.Body>
					</Card>
				</div>

				<div className='flex basis-1/4 flex-col pl-3'>
					<Card>
						<Card.Header>veBAO Rewards</Card.Header>
						<Card.Body></Card.Body>
					</Card>
				</div>
			</div>
		</>
	)
}

export default Lock
