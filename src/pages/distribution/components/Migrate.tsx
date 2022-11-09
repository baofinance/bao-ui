import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import CalendarIcon from '@heroicons/react/20/solid/CalendarIcon'
import ChevronLeftIcon from '@heroicons/react/20/solid/ChevronLeftIcon'
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { addYears, format } from 'date-fns'
import 'katex/dist/katex.min.css'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'

function addDays(numOfDays: number, date = new Date()) {
	date.setDate(date.getDate() + numOfDays)

	return date
}

function addMonths(numOfMonths: number, date = new Date()) {
	date.setMonth(date.getMonth() + numOfMonths)

	return date
}

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()

	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const [calendarIsOpen, setCalendarIsOpen] = useState(false)
	const startDate = new Date(addMonths(36, new Date()))
	const [endDate, setEndDate] = useState(startDate)
	const length = endDate.setUTCHours(0, 0, 0, 0) + 604800000

	const { account, chainId, library } = useWeb3React()
	const { data: merkleLeaf } = useQuery(['/api/vebao/distribution/proof', account, chainId], async () => {
		const leafResponse = await fetch(`/api/vebao/distribution/proof/${account}/`)
		const leaf = await leafResponse.json()
		return leaf
	})
	// console.log(merkleLeaf)

	const { data: distributionInfo, refetch } = useQuery(
		['distribution info', account, chainId],
		async () => {
			return await distribution.distributions(account)
		},
		{
			enabled: !!distribution,
		},
	)
	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	console.log('User has started distrubtion.', distributionInfo && distributionInfo.dateStarted.gt(0))

	const dateStarted = distributionInfo ? distributionInfo.dateStarted : 0

	console.log('Date Started', dateStarted.toString())

	console.log('Merkle Leaf', merkleLeaf)
	return (
		<>
			<Typography variant='p'>
				Choose to lock your balance directly into voting escrow BAO (veBAO) for a minimum of 3 years (the length of the unlock period).
				After you choose to lock into veBAO, you will no longer be able to participate in streaming of liquid BAOv2 tokens as all the tokens
				from your distribution will be converted to a locked veBAO balance. Locking into veBAO relinquishes access to your tokens as they
				will be locked, but you will get the benefits of having veBAO. veBAO gives ownership of a percentage of protocol fees and the
				ability to vote on governance proposals. Tokens locked into veBAO will not be subject to any slashing penalty.
			</Typography>
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
					/>{' '}
				</div>
			</div>

			<Button
				fullWidth
				onClick={async () => {
					const lockDistribution = distribution.lockDistribution(length.toString().slice(0, 10))

					handleTx(lockDistribution, `Distribution: Migrate to veBAO`)
				}}
			>
				Migrate to veBAO
			</Button>
		</>
	)
}

export default Migration
