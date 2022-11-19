import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGauges from '@/hooks/vebao/useGauges'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import React, { Fragment, useCallback, useState } from 'react'

const BoostCalc: React.FC = () => {
	const { account, chainId, library } = useWeb3React()
	const { handleTx } = useTransactionHandler()
	const gauges = useGauges()

	const [val, setVal] = useState('')
	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const [selectedOption, setSelectedOption] = useState('')

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
																	<p className={selected ? 'font-semibold' : 'font-normal'}>{gauge.name}</p>
																	{selected ? (
																		<span className={active ? 'text-text-100' : 'text-text-200'}>
																			<CheckIcon className='h-5 w-5' aria-hidden='true' />
																		</span>
																	) : null}
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
							<input type='number' className='rounded border border-primary-500 bg-primary-300 px-2 py-1 outline-none' />
						</div>
					</div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>BAO Tokens</label>
						<div className='flex h-8 gap-2 rounded-md bg-primary-100'>
							<input type='number' className='rounded border border-primary-500 bg-primary-300 px-2 py-1 outline-none' />
						</div>
					</div>
					<div className='col-span-2'>
						<label className='text-xs text-text-200'>Locked For</label>
						<div className='flex h-8 gap-2 rounded-md border border-primary-500 bg-primary-300 px-2 py-1'>
							<input
								type='range'
								id='points'
								defaultValue={0}
								min={0}
								max={100}
								disabled={false}
								value={val}
								className='form-range border-r-1 w-64 appearance-none rounded-md rounded-r-none border-primary-500 bg-primary-300 p-2 focus:shadow-none focus:outline-none focus:ring-0'
								onChange={handleChange}
								onInput={handleChange}
							/>
						</div>
					</div>
					<div>
						<Button>Calculate</Button>
					</div>
					<div>
						<label className='text-xs text-text-200'>Gauge Liquidity</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>12345</Typography>
						</div>
					</div>
					<div>
						<label className='text-xs text-text-200'>veBAO</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>12345</Typography>
						</div>
					</div>
					<div>
						<label className='text-xs text-text-200'>Boost</label>
						<div className='flex h-8 gap-2 rounded-md'>
							<Typography>1.45x</Typography>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default BoostCalc
