import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import usePrice from '@/hooks/base/usePrice'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGaugeInfo from '@/hooks/gauges/useGaugeInfo'
import useGaugeTVL from '@/hooks/gauges/useGaugeTVL'
import useGauges from '@/hooks/gauges/useGauges'
import useMintable from '@/hooks/gauges/useMintable'
import useRelativeWeight from '@/hooks/gauges/useRelativeWeight'
import useVotingPowerAllocated from '@/hooks/gauges/useVotingPowerAllocated'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useUserSlopes from '@/hooks/vebao/useUserSlopes'
import useVeInfo from '@/hooks/vebao/useVeInfo'
import CountdownTimer from '@/pages/gauges/components/CountdownTimer'
import { GaugeController } from '@/typechain/GaugeController'
import { getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import Link from 'next/link'
import Slider from 'rc-slider'
import React, { Fragment, useCallback, useState } from 'react'

export const Dashboard = () => {
	const { account } = useWeb3React()
	const [boost, setBoost] = useState(1)
	const [selectedOption, setSelectedOption] = useState('baoUSD-3CRV')
	const veInfo = useVeInfo()
	const lockInfo = useLockInfo()

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

	const onCalcSliderChange = (value: number | number[]) => {
		setWeeks(value as number)
		setLockTime(getDayOffset(currentLockEnd, (value as number) * 7))
	}

	const { pendingTx, handleTx } = useTransactionHandler()
	const gaugeControllerContract = useContract<GaugeController>('GaugeController')

	const { gaugeTVL } = useGaugeTVL(gauge)
	const [baoAmount, setBaoAmount] = useState('')
	const [depositAmount, setDepositAmount] = useState('')
	const veEstimate = veBaoEstimate(parseFloat(baoAmount), lockTime)
	const totalVePower = veInfo?.totalSupply ? parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const tvl = gaugeTVL ? parseFloat(formatUnits(gaugeTVL)) : 0
	const votingPowerAllocated = useVotingPowerAllocated()

	const baoPrice = usePrice('bao-finance-v2')
	const mintable = useMintable()
	const { currentWeight, futureWeight } = useRelativeWeight(gauge.gaugeAddress)
	const rewardsValue = baoPrice ? baoPrice.mul(mintable) : BigNumber.from(0)
	const currentAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(currentWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)
	const futureAPR = gaugeTVL && gaugeTVL.gt(0) ? rewardsValue.mul(futureWeight).div(gaugeTVL).mul(100).toString() : BigNumber.from(0)

	const userSlopes = useUserSlopes(gauge)
	const [val, setVal] = useState<string | number>(
		userSlopes && BigNumber.from(userSlopes.power) !== BigNumber.from(0) ? userSlopes.power.div(100).toString() : '0',
	)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const onVotingSliderChange = (value: number | number[]) => {
		setVal(value as number)
	}

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
		console.log(gauge.symbol, 'depositAmount', depositAmount)
		const l = parseFloat(depositAmount) * 1e18
		const lim = (l * 40) / 100
		console.log(gauge.symbol, 'l', l)
		const working_balances = gaugeInfo && account ? parseFloat(depositAmount) * 1e18 : 1 * 1e18 //determine workingBalance of depositAmount
		console.log(gauge.symbol, 'working_balances', working_balances)
		const working_supply = gaugeInfo && parseFloat(gaugeInfo.workingSupply.toString())
		console.log(gauge.symbol, 'working_supply', working_supply)
		console.log(gauge.symbol, 'tvl', tvl)
		const L = tvl + l
		console.log(gauge.symbol, 'L', L)
		console.log(gauge.symbol, 'lim', lim)
		console.log(gauge.symbol, 'veEstimate', veEstimate)
		const veBAO = veEstimate * 1e18
		console.log(gauge.symbol, 'veBAO', veBAO)
		console.log(gauge.symbol, 'totalVePower', totalVePower)
		const limplus = lim + (L * veBAO * 60) / (totalVePower * 1e20)
		console.log(gauge.symbol, 'limplus', limplus)
		const limfinal = Math.min(l, limplus)
		console.log(gauge.symbol, 'limfinal', limfinal)
		const old_bal = working_balances
		console.log(gauge.symbol, 'old_bal', old_bal)
		const noboost_lim = (l * 40) / 100
		console.log(gauge.symbol, 'noboost_lim', noboost_lim)
		const noboost_supply = working_supply + noboost_lim - old_bal
		console.log(gauge.symbol, 'noboost_supply', noboost_supply)
		const _working_supply = working_supply + limfinal - old_bal
		console.log(gauge.symbol, 'working_supply', _working_supply)
		const boost = limfinal / _working_supply / (noboost_lim / noboost_supply)
		console.log(gauge.symbol, 'boost', boost)

		return [_working_supply, boost]
	}

	return (
		<div>
			<Typography variant='xl' className='mb-2 mt-4 font-bold'>
				Voting Dashboard
			</Typography>
			<div className={` w-full justify-evenly gap-4 rounded border bg-opacity-80 p-4`}>
				<div className='grid grid-cols-3 gap-4'>
					<div className='col-span-1'>
						<label className='text-xs text-baoRed'>Select Gauge</label>
						<Listbox value={selectedOption} onChange={setSelectedOption}>
							{({ open }) => (
								<>
									<div>
										<div className='inline-flex rounded-md border-none shadow-sm'>
											<div className='inline-flex rounded-md border-none shadow-sm'>
												<div className=' inline-flex items-center rounded-l-md border py-2 pl-3 pr-4 text-white shadow-sm'>
													{selectedOption === '' ? (
														<Typography>Select a gauge</Typography>
													) : (
														<div className='mx-0 my-auto inline-block h-full items-center'>
															<div className='mr-2 inline-block'>
																<Image
																	className='z-10 inline-block select-none'
																	src={gauge.iconA}
																	alt={gauge.symbol}
																	width={24}
																	height={24}
																/>
																<Image
																	className='z-20 -ml-2 inline-block select-none'
																	src={gauge.iconB}
																	alt={gauge.symbol}
																	width={24}
																	height={24}
																/>
															</div>
															<span className='inline-block text-left align-middle'>
																<Typography variant='sm' className='font-bold'>
																	{gauge.name}
																</Typography>
																<Typography variant='xs' className={`font-light text-baoRed`}>
																	{gauge.type.toLowerCase() === 'curve' ? (
																		<Image src='/images/platforms/Curve.png' height={12} width={12} alt='Curve' className='mr-1 inline' />
																	) : gauge.type.toLowerCase() === 'uniswap' ? (
																		<Image
																			src='/images/platforms/Uniswap.png'
																			height={12}
																			width={12}
																			alt='Uniswap'
																			className='mr-1 inline'
																		/>
																	) : (
																		<Image src='/images/platforms/Saddle.png' height={12} width={12} alt='Saddle' className='mr-1 inline' />
																	)}
																	{gauge.type}
																</Typography>
															</span>
														</div>
													)}
												</div>
												<Listbox.Button
													className={
														(classNames(open ? 'bg-transparent-100 text-baoRed' : 'text-baoWhite'),
														'bg-primary-200 inline-flex items-center rounded-l-none rounded-r-md border p-2 text-sm font-medium text-baoWhite hover:bg-transparent-100')
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
											<Listbox.Options className='divide-primary-500 border-primary-500  absolute z-10 mt-1 h-auto w-auto origin-top-right divide-y overflow-hidden rounded-md border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
												{gauges.length ? (
													gauges.map((gauge: any, i: number) => (
														<Listbox.Option
															key={gauge.name}
															className={({ active }) =>
																classNames(
																	active ? ' text-baoRed' : 'text-baoWhite',
																	'cursor-pointer select-none p-2 text-sm',
																)
															}
															value={gauge.name}
														>
															{({ selected, active }) => (
																<div className='mx-0 my-auto inline-block h-full items-center'>
																	<div className='mr-2 inline-block'>
																		<Image
																			className='z-10 inline-block select-none'
																			src={gauge.iconA}
																			alt={gauge.symbol}
																			width={24}
																			height={24}
																		/>
																		<Image
																			className='z-20 -ml-2 inline-block select-none'
																			src={gauge.iconB}
																			alt={gauge.symbol}
																			width={24}
																			height={24}
																		/>
																	</div>
																	<span className='inline-block text-left align-middle'>
																		<Typography variant='sm' className='font-bold'>
																			{gauge.name}
																		</Typography>
																		<Typography variant='xs' className={`font-light text-baoRed`}>
																			{gauge.type.toLowerCase() === 'curve' ? (
																				<Image
																					src='/images/platforms/Curve.png'
																					height={12}
																					width={12}
																					alt='Curve'
																					className='mr-1 inline'
																				/>
																			) : gauge.type.toLowerCase() === 'uniswap' ? (
																				<Image
																					src='/images/platforms/Uniswap.png'
																					height={12}
																					width={12}
																					alt='Uniswap'
																					className='mr-1 inline'
																				/>
																			) : (
																				<Image
																					src='/images/platforms/Saddle.png'
																					height={12}
																					width={12}
																					alt='Saddle'
																					className='mr-1 inline'
																				/>
																			)}
																			{gauge.type}
																		</Typography>
																	</span>
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
					<div className='col-span-1 mt-6 flex items-center justify-center text-center align-middle'>
						<div className='m-auto'>
							<div className='text-center'>
								<Typography variant='xs' className='text-baoRed'>
									Voting Period Ends
								</Typography>
							</div>
							<div className='text-lg font-bold'>
								<CountdownTimer />
							</div>
						</div>
					</div>
					<div className='col-span-1 mt-6 flex items-center justify-center text-center align-middle'>
						<div className='m-auto align-middle'>
							<div className='text-center'>
								<Typography variant='xs' className='text-baoRed'>
									Total Voting Power Allocated
								</Typography>
							</div>
							<Typography variant='lg' className='font-bold'>
								{(votingPowerAllocated ? votingPowerAllocated.div(BigNumber.from(100)) : BigNumber.from(0)).toString()}%
							</Typography>
						</div>
					</div>
				</div>
				{/* End of Header Section */}
				{/* Start of Gauge Stats Section */}
				<div className='mt-8 grid grid-cols-6 gap-4'>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-baoRed'>
								Gauge TVL
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bold'>
							${gaugeTVL ? getDisplayBalance(decimate(gaugeTVL)) : '0'}
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-baoRed'>
								Total veBAO Allocated
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bold'>
							{veInfo ? (parseFloat(formatUnits(veInfo.totalSupply)) * parseFloat(formatUnits(currentWeight))).toLocaleString() : '0'}
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-baoRed'>
								Current Weight
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bold'>
							{getDisplayBalance(currentWeight.mul(100), 18, 2)}%
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-baoRed'>
								Current APR
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bold'>
							{getDisplayBalance(currentAPR)}%
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-baoRed'>
								Future Weight
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bold'>
							{getDisplayBalance(futureWeight.mul(100), 18, 2)}%
						</Typography>
					</div>
					<div className='col-span-1 mx-auto my-0 text-center'>
						<div className='text-center'>
							<Typography variant='xs' className='text-baoRed'>
								Future APR
							</Typography>
						</div>
						<Typography variant='lg' className='ml-2 inline-block font-bold'>
							{getDisplayBalance(futureAPR)}%
						</Typography>
					</div>
				</div>
				{/* End of Gauge Stats Section */}
				{/* Start of Voting Slider Section */}
				<div className={`mx-auto my-0 mt-4 flex basis-[40%] flex-col text-left`}>
					<div className='flex w-full items-center justify-center gap-2 rounded-md'>
						<input
							type='range'
							id='points'
							defaultValue={
								userSlopes && BigNumber.from(userSlopes.power) !== BigNumber.from(0) ? userSlopes.power.div(100).toString() : val
							}
							disabled={userSlopes && votingPowerAllocated.div(100).eq(100) && userSlopes.power.eq(0)}
							min={0}
							max={
								userSlopes && userSlopes.power.eq(0) && votingPowerAllocated.eq(0)
									? BigNumber.from(100).toString()
									: userSlopes && votingPowerAllocated.div(100).eq(100) && userSlopes.power.eq(0)
									? BigNumber.from(0).toString()
									: userSlopes && votingPowerAllocated.div(100).gt(0)
									? userSlopes && BigNumber.from(100).add(userSlopes.power.div(100)).sub(votingPowerAllocated.div(100)).toString()
									: userSlopes && BigNumber.from(100).add(userSlopes.power.div(100)).sub(userSlopes.power.div(100)).toString()
							}
							value={val}
							className='bg-primary-400 accent-text-400 h-2 w-full appearance-none rounded-full disabled:cursor-not-allowed'
							onChange={handleChange}
							onInput={handleChange}
						/>

						<input
							type='number'
							id='points'
							disabled={true}
							onChange={handleChange}
							placeholder={val.toString()}
							value={val}
							className=' relative -mr-1 h-6
				w-12 appearance-none rounded border-solid border-inherit pl-2 text-end 
				align-middle font-bold outline-none outline outline-2 outline-offset-2
				 transition-all duration-200 disabled:text-baoWhite md:text-sm'
						/>
						<Typography variant='base' className='border-primary-500  m-0 rounded border-solid border-inherit p-0 font-bold'>
							%
						</Typography>
						<>
							{pendingTx ? (
								<Button className='ml-8 w-[20%]' disabled={true}>
									<Loader />
								</Button>
							) : (
								<Button
									className='ml-8 w-[20%]'
									disabled={!val || isNaN(val as any) || (lockInfo && lockInfo.balance.eq(0))}
									onClick={async () => {
										const voteTx = gaugeControllerContract.vote_for_gauge_weights(gauge.gaugeAddress, BigNumber.from(val).mul(100))
										handleTx(voteTx, `${gauge.name} Gauge: Voted ${parseFloat(BigNumber.from(val).toString()).toFixed(2)}% of your veBAO`)
									}}
								>
									Vote
								</Button>
							)}
						</>
					</div>
				</div>
				{/* End of Voting Slider Section */}
				<div className='m-4' />
				{/* Start of BoostCalc Section */}
				<Typography variant='xl' className='mb-2 mt-4 font-bold'>
					Boost Calculator
				</Typography>
				<div className='mt-4 grid grid-cols-6 gap-4'>
					<div className='col-span-2'>
						<label className='text-sm text-baoRed'>Deposit Amount</label>
						<div className=' flex h-8 gap-2 rounded-md'>
							<input
								type='number'
								className='border-primary-500 rounded border bg-transparent-100 px-2 py-1 outline-none'
								value={depositAmount}
								onChange={handleDepositChange}
							/>
						</div>
					</div>
					<div className='col-span-2'>
						<label className='text-sm text-baoRed'>BAO Tokens</label>
						<div className=' flex h-8 gap-2 rounded-md'>
							<input
								type='number'
								className='border-primary-500 rounded border bg-transparent-100 px-2 py-1 outline-none'
								value={baoAmount}
								onChange={handleBaoChange}
							/>
						</div>
					</div>
					<div className='col-span-2'>
						<div className='w-full'>
							<label className='float-left mb-2 text-sm text-baoRed'>Lock until</label>
							<label className='float-right mb-2 text-sm text-baoWhite'>{new Date(lockTime).toDateString()}</label>
						</div>
						<div className='p-4'>
							<Slider
								defaultValue={min}
								min={min}
								max={max}
								value={weeks}
								onChange={onCalcSliderChange}
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
					<div className='col-span-2'>
						<Button onClick={calc}>Calculate</Button>
					</div>
					<div className='col-span-2 justify-center text-center'>
						<label className='text-sm text-baoRed'>veBAO</label>
						<div className='flex h-8 gap-2 rounded-md !text-center font-bold'>
							<Typography className='inline-block w-full !text-center font-bold'>
								{isNaN(veBaoEstimate(parseFloat(baoAmount), lockTime))
									? 0
									: veBaoEstimate(parseFloat(baoAmount), lockTime).toLocaleString()}
							</Typography>
						</div>
					</div>
					<div className='col-span-2 h-12 text-center'>
						<label className='text-sm text-baoRed'>Boost</label>
						<div className='flex w-full gap-2 rounded-md'>
							<Typography className='inline-block w-full !text-center font-bold'>
								{`${Math.min(boost < 0 ? 2.5 : boost, 2.5).toFixed(2)}`}
								<Typography className='inline-block text-baoRed'>x</Typography>
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
