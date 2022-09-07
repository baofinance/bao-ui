import Badge from '@/components/Badge'
import useLockedEarnings from '@/hooks/farms/useLockedEarnings'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { Typography } from '@material-tailwind/react'
import classNames from 'classnames'
import React, { Fragment, useState } from 'react'

const options = [
	{
		id: 1,
		name: 'Migrate to veBAO',
		shortDesc: 'Migrate your locked BAOv1 to veBAO.',
		desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
	},
	{
		id: 2,
		name: 'Claim Now',
		shortDesc: 'Claim your unlocked BAO.',
		desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
	},
	{
		id: 3,
		name: 'End Distribution',
		shortDesc: 'End your distribution.',
		desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
	},
]

const Distribution: React.FC = () => {
	const [selectedOption, setSelectedOption] = useState(options[0])
	const locks = useLockedEarnings()

	return (
		<>
			<div className={`flex-flow mx-auto my-4 flex items-center justify-center`}>
				<Typography className='px-2 text-sm text-text-200'>Your Locked BAO</Typography>
				<Badge>{getDisplayBalance(locks)}</Badge>
			</div>
			<div className='my-4 flex w-1/4 flex-col'>
				<Listbox value={selectedOption} onChange={setSelectedOption}>
					{({ open }) => (
						<>
							<Listbox.Label className='mb-1 text-xs text-text-200'>Select your distribution option</Listbox.Label>
							<div className='relative'>
								<div className='inline-flex w-full rounded-md border-none shadow-sm'>
									<div className='inline-flex w-full rounded-md border-none shadow-sm'>
										<div className='inline-flex w-full items-center rounded-l-md border border-primary-300 bg-primary-100 py-2 pl-3 pr-4 text-white shadow-sm'>
											<CheckIcon className='h-5 w-5' aria-hidden='true' />
											<p className='ml-2.5 text-sm font-medium'>{selectedOption.name}</p>
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
										{options.map(option => (
											<Listbox.Option
												key={option.name}
												className={({ active }) =>
													classNames(active ? 'bg-primary-100 text-text-400' : 'text-text-100', 'cursor-default select-none p-4 text-sm')
												}
												value={option}
											>
												{({ selected, active }) => (
													<div className='flex flex-col'>
														<div className='flex justify-between'>
															<p className={selected ? 'font-semibold' : 'font-normal'}>{option.name}</p>
															{selected ? (
																<span className={active ? 'text-text-100' : 'text-text-200'}>
																	<CheckIcon className='h-5 w-5' aria-hidden='true' />
																</span>
															) : null}
														</div>
														<p className={classNames(active ? 'text-text-100' : 'text-text-200', 'mt-2')}>{option.shortDesc}</p>
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
			<div className='flex flex-row rounded bg-primary-100 p-4'>{selectedOption.desc}</div>
		</>
	)
}

export default Distribution
