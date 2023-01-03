import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useGauges from '@/hooks/gauges/useGauges'
import useGaugeTVL from '@/hooks/gauges/useGaugeTVL'
import { VeInfo } from '@/hooks/vebao/useVeInfo'
import { getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import Slider from 'rc-slider'
import React, { Fragment, useCallback, useState } from 'react'

type BoostCalcProps = {
	veInfo: VeInfo
}

export const BoostCalc = ({ veInfo }: BoostCalcProps) => {
	const [selectedOption, setSelectedOption] = useState('baoUSD-3CRV')

	const gauges = useGauges()

	const gauge = gauges.length ? gauges.find(gauge => gauge.name === selectedOption) : gauges.find(gauge => gauge.name === 'baoUSD-3CRV')

	const WEEK = 7 * 86400
	const MAXTIME = 4 * 365 * 86400

	const veBaoEstimate = (amount: number, unlockDate: Date, currentUnlockDate: Date | undefined = undefined) => {
		const rounded = Math.floor(getEpochSecondForDay(unlockDate) / WEEK) * WEEK
		return ((rounded - (currentUnlockDate ? +currentUnlockDate : +new Date()) / 1000) / MAXTIME) * amount
	}

	const currentLockEnd = new Date()
	const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1))
	const min = currentLockEnd.getUTCHours() < new Date().getUTCHours() ? new Date().getUTCHours() : currentLockEnd.getUTCHours()
	const max = getWeekDiff(currentLockEnd, getDayOffset(new Date(), 365 * 4 - 7))
	const [weeks, setWeeks] = useState<number>(max)

	const onSliderChange = (value: number | number[]) => {
		setWeeks(value as number)
		setLockTime(getDayOffset(currentLockEnd, (value as number) * 7))
	}

	const gaugeTVL = useGaugeTVL(gauge)
	const [baoAmount, setBaoAmount] = useState('')
	const [depositAmount, setDepositAmount] = useState('')
	const veEstimate = veBaoEstimate(parseFloat(baoAmount), lockTime)
	const totalVePower = veInfo?.totalSupply ? parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const tvl = gaugeTVL.gaugeTVL ? parseFloat(formatUnits(gaugeTVL.gaugeTVL)) : 0

	const handleBaoChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setBaoAmount(e.currentTarget.value)
		},
		[setBaoAmount],
	)

	const handleDepositChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setDepositAmount(e.currentTarget.value)
		},
		[setDepositAmount],
	)

	return (
		<>
			<div>
				<Typography variant='xl' className='mt-4 font-bold'>
					Boost Calculator
				</Typography>
				<div
					className={`my-2 grid w-full grid-cols-8 justify-evenly gap-4 rounded border border-primary-300 bg-primary-100 bg-opacity-80 p-4`}
				>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>Select a gauge</label>
						<Listbox value={selectedOption} onChange={setSelectedOption}>
							{({ open }) => (
								<>
									<div>
										<div className='inline-flex rounded-md border-none shadow-sm'>
											<div className='inline-flex rounded-md border-none shadow-sm'>
												<div className='inline-flex h-8 items-center rounded-l-md border border-primary-300 bg-primary-100 py-2 pl-3 pr-4 text-white shadow-sm'>
													<span className={`mr-1 text-text-400`}>
														<CheckIcon className='h-5 w-5' aria-hidden='true' />
													</span>
													<p className='ml-2.5 text-sm font-medium'>{selectedOption === '' ? 'Select a gauge' : selectedOption}</p>
												</div>
												<Listbox.Button
													className={
														(classNames(open ? 'bg-primary-300 text-text-400' : 'text-text-100'),
														'inline-flex h-8 items-center rounded-l-none rounded-r-md border border-primary-300 bg-primary-200 p-2 text-sm font-medium text-text-100 hover:bg-primary-300')
													}
												>
													<ChevronDownIcon className='h-5 w-5 text-white' aria-hidden='true' />
												</Listbox.Button>
											</div>
										</div>
										<Transition
											show={open}
											as={Fragment}
											leave='transition ease-in duration-100'
											leaveFrom='opacity-100'
											leaveTo='opacity-0'
										>
											<Listbox.Options className='absolute z-10 mt-1 h-auto w-auto origin-top-right divide-y divide-primary-500 overflow-hidden rounded-md border border-primary-500 bg-primary-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
												{gauges.length ? (
													gauges.map((gauge: any, i: number) => (
														<Listbox.Option
															key={gauge.name}
															className={({ active }) =>
																classNames(
																	active ? 'bg-primary-100 text-text-400' : 'text-text-100',
																	'cursor-pointer select-none p-2 text-sm',
																)
															}
															value={gauge.name}
														>
															{({ selected, active }) => (
																<div className='flex justify-between'>
																	{selected ? (
																		<span className={`mr-1 text-text-400`}>
																			<CheckIcon className='h-5 w-5' aria-hidden='true' />
																		</span>
																	) : null}
																	<p className={selected ? 'font-semibold' : 'font-normal'}>{gauge.name}</p>
																</div>
															)}
														</Listbox.Option>
													))
												) : (
													<Typography>Select a gauge</Typography>
												)}
											</Listbox.Options>
										</Transition>
									</div>
								</>
							)}
						</Listbox>
					</div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>Deposit Amount</label>
						<div className='flex h-8 gap-2 rounded-md bg-primary-100'>
							<input
								type='number'
								className='rounded border border-primary-500 bg-primary-300 px-2 py-1 outline-none'
								value={depositAmount}
								onChange={handleDepositChange}
							/>
						</div>
					</div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>BAO Tokens</label>
						<div className='flex h-8 gap-2 rounded-md bg-primary-100'>
							<input
								type='number'
								className='rounded border border-primary-500 bg-primary-300 px-2 py-1 outline-none'
								value={baoAmount}
								onChange={handleBaoChange}
							/>
						</div>
					</div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>Locked For</label>
						<div className='px-2'>
							<Slider
								defaultValue={min}
								min={min}
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
					</div>
					<div>
						<Button>Calculate</Button>
					</div>
					<div>
						<label className='text-xs text-text-200'>Gauge Liquidity</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>${gaugeTVL.gaugeTVL ? getDisplayBalance(decimate(gaugeTVL.gaugeTVL)) : '0'}</Typography>
						</div>
					</div>
					<div>
						<label className='text-xs text-text-200'>veBAO</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>
								{isNaN(veBaoEstimate(parseFloat(baoAmount), lockTime)) ? 0 : veBaoEstimate(parseFloat(baoAmount), lockTime).toFixed(2)}
							</Typography>
						</div>
					</div>
					<div>
						<label className='text-xs text-text-200'>Boost</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>
								{(!depositAmount && !gaugeTVL.gaugeTVL && !veInfo) ||
								isNaN((parseFloat(depositAmount) * 40) / 100 + (((tvl * veEstimate) / totalVePower) * (100 - 40)) / 100)
									? 0
									: (parseFloat(depositAmount) * 40) / 100 + (((tvl * veEstimate) / totalVePower) * (100 - 40)) / 100}
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default BoostCalc
