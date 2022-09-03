import Config from '@/bao/lib/config'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { StatCards } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import { decimate, getDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Typography } from '@material-tailwind/react'
import { useWeb3React } from '@web3-react/core'
import { addYears, format } from 'date-fns'
import Image from 'next/future/image'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'

const Lock: React.FC = () => {
	const bao = useBao()
	const { account } = useWeb3React()
	const [inputVal, setInputVal] = useState('')
	const [endDate, setEndDate] = useState(new Date())
	const baoBalance = useTokenBalance(Config.addressMap.BAO)

	return (
		<>
			<StatCards
				stats={[
					{
						label: `BAO Balance`,
						value: (
							<Tooltipped content={`Your unlocked BAO balance.`}>
								<a>
									<Image src='/images/tokens/BAO.png' alt='BAO' width={32} height={32} />
									{account ? (window.screen.width > 1200 ? getDisplayBalance(baoBalance) : truncateNumber(baoBalance)) : '-'}
								</a>
							</Tooltipped>
						),
					},
					{
						label: `Locked (until 2023-7-5)`,
						value: (
							<Tooltipped content={`Your locked veBAO balance.`}>
								<a>-</a>
							</Tooltipped>
						),
					},
					{
						label: `APR`,
						value: `-`,
					},
					{
						label: `Total Locked`,
						value: `-`,
					},
				]}
			/>
			<Card>
				<Card.Header>Lock BAO for veBAO</Card.Header>
				<Card.Body>
					<Typography variant='p'>
						Lock your BAO for veBAO to participate in protocol governance, earn a share of protocol revenue, and boost your yields from
						providing liquidity.
					</Typography>
					<div className='flex flex-row'>
						<div className='flex flex-col'>
							<Input
								onSelectMax={() => setInputVal(decimate(baoBalance).toString())}
								onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
								value={inputVal}
								label={
									<div className='flex flex-row items-center pl-2 pr-4'>
										<div className='flex w-6 justify-center'>
											<Image src='/images/tokens/BAO.png' width={32} height={32} alt='BAO' className='block h-6 w-6 align-middle' />
										</div>
									</div>
								}
							/>
						</div>
						<div className='flex flex-col'>
							<div className='relative w-40'>
								<DatePicker
									onChange={(date: Date) => setEndDate(date)}
									minDate={new Date()}
									maxDate={addYears(new Date(), 4)}
									selected={endDate}
									nextMonthButtonLabel='>'
									previousMonthButtonLabel='<'
									popperClassName='react-datepicker-left'
									customInput={
										<button
											type='button'
											className='focus:ring-blue-500 inline-flex w-full justify-start rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0'
										>
											{format(new Date(endDate), 'MM dd yyyy')}
										</button>
									}
									renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
										<div className='flex items-center justify-between px-2 py-2'>
											<span className='text-lg text-gray-700'>{format(date, 'MMMM yyyy')}</span>

											<div className='space-x-2'>
												<button
													onClick={decreaseMonth}
													disabled={prevMonthButtonDisabled}
													type='button'
													className={`
                                            ${prevMonthButtonDisabled && 'cursor-not-allowed opacity-50'}
                                            focus:ring-blue-500 inline-flex rounded border border-gray-300 bg-white p-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0
                                        `}
												>
													<FontAwesomeIcon icon={faChevronLeft} className='h-5 w-5 text-gray-600' />
												</button>

												<button
													onClick={increaseMonth}
													disabled={nextMonthButtonDisabled}
													type='button'
													className={`
                                            ${nextMonthButtonDisabled && 'cursor-not-allowed opacity-50'}
                                            focus:ring-blue-500 inline-flex rounded border border-gray-300 bg-white p-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0
                                        `}
												>
													<FontAwesomeIcon icon={faChevronRight} className='h-5 w-5 text-gray-600' />
												</button>
											</div>
										</div>
									)}
								/>
							</div>
						</div>
					</div>
				</Card.Body>
			</Card>
		</>
	)
}

export default Lock
