import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useGaugeInfo from '@/hooks/gauges/useGaugeInfo'
import useGauges from '@/hooks/gauges/useGauges'
import useGaugeTVL from '@/hooks/gauges/useGaugeTVL'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import { getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import Slider from 'rc-slider'
import React, { Fragment, useCallback, useState } from 'react'

export const BoostCalc = () => {
	const { account } = useWeb3React()
	const [boost, setBoost] = useState(1)
	const [selectedOption, setSelectedOption] = useState('baoUSD-3CRV')
	const veInfo = useVeInfo()

	const gauges = useGauges()

	const gauge = gauges.length ? gauges.find(gauge => gauge.name === selectedOption) : gauges.find(gauge => gauge.name === 'baoUSD-3CRV')
	const gaugeInfo = useGaugeInfo(gauge)

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

	const calc = async () => {
		const [_, boost] = await updateLiquidityLimit(depositAmount, veEstimate, totalVePower, tvl)
		setBoost(boost)
	}

	const updateLiquidityLimit = async (depositAmount: string, veEstimate: number, totalVePower: number, tvl: number) => {
		const l = parseFloat(depositAmount) * 1e18
		const working_balances = gaugeInfo && account ? parseFloat(depositAmount) * 1e18 : 1 * 1e18 //determine workingBalance of depositAmount
		const working_supply = gaugeInfo && parseFloat(formatUnits(gaugeInfo.workingSupply))
		const L = tvl + l
		const lim = (l * 40) / 100
		const veBAO = veEstimate * 1e18
		const limplus = lim + (L * veBAO * 60) / (totalVePower * 1e20)
		const limfinal = Math.min(l, limplus)

		const old_bal = working_balances
		const noboost_lim = (l * 40) / 100
		const noboost_supply = working_supply + noboost_lim - old_bal
		const _working_supply = working_supply + limfinal - old_bal
		const boost = limfinal / _working_supply / (noboost_lim / noboost_supply)

		return [_working_supply, boost]
	}

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
													gauges.map((gauge: any) => (
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
															{({ selected }) => (
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
						<label className='text-xs text-text-100'>Locked until {new Date(lockTime).toDateString()}</label>
						<div className='pr-2'>
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
					<div className='col-span-2'> </div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>Gauge Liquidity</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>${gaugeTVL.gaugeTVL ? getDisplayBalance(decimate(gaugeTVL.gaugeTVL)) : '0'}</Typography>
						</div>
					</div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>veBAO</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>
								{isNaN(veBaoEstimate(parseFloat(baoAmount), lockTime))
									? 0
									: veBaoEstimate(parseFloat(baoAmount), lockTime).toLocaleString()}
							</Typography>
						</div>
					</div>
					<div className='col-span-1'>
						<Button onClick={calc} className='w-full'>
							Calculate
						</Button>
					</div>
					<div className='col-span-1 text-right'>
						<label className='text-xs text-text-200'>Boost</label>
						<div className='flex h-8 w-full gap-2 rounded-md'>
							<Typography className='w-full !text-right'>{`${Math.min(boost < 0 ? 2.5 : boost, 2.5).toFixed(2)}`}x</Typography>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default BoostCalc
