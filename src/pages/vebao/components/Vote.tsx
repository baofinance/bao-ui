import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGauges from '@/hooks/vebao/useGauges'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { Typography } from '@material-tailwind/react'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import Link from 'next/link'
import React, { Fragment, useCallback, useMemo, useState } from 'react'

const Vote: React.FC = () => {
	const bao = useBao()
	const { account } = useWeb3React()
	const [val, setVal] = useState('')
	const gauges = useGauges()
	const lockInfo = useLockInfo()
	const { pendingTx, handleTx } = useTransactionHandler()
	const [selectedOption, setSelectedOption] = useState()

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(lockInfo && lockInfo.balance)
	}, [lockInfo])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [lockInfo, setVal])

	return (
		<>
			<div className='border-b border-text-100 pb-5'>
				<h3 className='text-lg font-medium leading-6 text-text-100'>Gauge Weight Voting</h3>
				<p className='mt-2 max-w-4xl text-sm text-text-200'>
					Use your veBAO to vote for gauge weights. Gauge weights determine how much BAO is distributed to each gauge. The more veBAO you
					have, the more weight your vote has.
				</p>
			</div>
			<Typography>You&lsquo;re voting with {getDisplayBalance(lockInfo && lockInfo.balance)} veBAO</Typography>
			<div className='my-4 flex w-1/4 flex-col'>
				<Listbox value={selectedOption} onChange={setSelectedOption}>
					{({ open }) => (
						<>
							<div className='relative'>
								<div className='inline-flex w-full rounded-md border-none shadow-sm'>
									<div className='inline-flex w-full rounded-md border-none shadow-sm'>
										<div className='inline-flex w-full items-center rounded-l-md border border-primary-300 bg-primary-100 text-white shadow-sm'>
											<p className='ml-2.5 text-sm font-medium'>{selectedOption ? selectedOption : 'Select gauge'}</p>
										</div>
										<Listbox.Button
											className={
												(classNames(open ? 'bg-primary-300 text-text-400' : 'text-text-100'),
												'inline-flex items-center rounded-l-none rounded-r-md border border-primary-300 bg-primary-200 p-2 text-sm font-medium text-text-100 hover:bg-primary-300')
											}
										>
											<ChevronDownIcon className='h-5 w-5 text-white' aria-hidden='true' />
										</Listbox.Button>
									</div>
								</div>

								<Transition show={open} as={Fragment} leave='transition ease-in duration-100' leaveFrom='opacity-100' leaveTo='opacity-0'>
									<Listbox.Options className='absolute z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-primary-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
										{gauges &&
											gauges.map(gauge => (
												<Listbox.Option
													key={gauge.name}
													className={({ active }) =>
														classNames(active ? 'bg-primary-100 text-text-400' : 'text-text-100', 'cursor-default select-none p-4 text-sm')
													}
													value={gauge.name}
												>
													{({ selected, active }) => (
														<div className='flex flex-col'>
															<div className='flex justify-between'>
																<p className={selected ? 'font-semibold' : 'font-normal'}>
																	{gauge.name} - {gauge.gaugeAddress.slice(0, 6)}...
																	{gauge.gaugeAddress.slice(gauge.gaugeAddress.length - 4, gauge.gaugeAddress.length)}
																</p>
																{selected ? (
																	<span className={active ? 'text-text-100' : 'text-text-200'}>
																		<CheckIcon className='h-5 w-5' aria-hidden='true' />
																	</span>
																) : null}
															</div>
															{/* <p className={classNames(active ? 'text-text-100' : 'text-text-200', 'mt-2')}>{gauge.shortDesc}</p> */}
														</div>
													)}
												</Listbox.Option>
											))}
									</Listbox.Options>
								</Transition>
							</div>
						</>
					)}
				</Listbox>
			</div>
			<div className='my-4 flex h-12 flex-row'>
				<Typography>
					Vote{' '}
					<input
						type='number'
						value={val}
						onChange={handleChange}
						className='relative h-8 w-10 min-w-0 appearance-none
				rounded border-solid border-inherit bg-primary-400 pl-2 pr-2 text-end 
				align-middle outline-none outline outline-2 outline-offset-2 transition-all
				 duration-200 disabled:text-text-200 md:text-sm'
					/>
					% (of your voting power)
				</Typography>
			</div>
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
					disabled={!val || !bao || isNaN(val as any)}
					// onClick={async () => {
					// 	const stakeTx = selectedOption.gaugeContract.methods.vote_for_gauge_weights(parseFloat(val) * 10).send({ from: account })

					// 	handleTx(stakeTx, `Deposit ${parseFloat(val).toFixed(4)} ${selectedOption} into gauge`)
					// }}
				>
					Vote for {selectedOption}
				</Button>
			)}
		</>
	)
}

export default Vote
