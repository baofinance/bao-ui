import Typography from '@/components/Typography'
import useLockedEarnings from '@/hooks/farms/useLockedEarnings'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import Image from 'next/future/image'
import React, { Fragment, useState } from 'react'
import 'katex/dist/katex.min.css'
import Latex from 'react-latex-next'

const options = [
	{
		id: 1,
		name: 'Migrate to veBAO',
		shortDesc: 'Migrate your locked BAOv1 to veBAO.',
		desc: (
			<>
				<Typography variant='p'>
					Choose to lock your balance directly into voting escrow BAO (veBAO) for a minimum of 3 years (the length of the unlock period).
					After you choose to lock into veBAO, you will no longer be able to participate in streaming of liquid BAOv2 tokens as all the
					tokens from your distribution will be converted to a locked veBAO balance. Locking into veBAO relinquishes access to your tokens
					as they will be locked, but you will get the benefits of having veBAO. veBAO gives ownership of a percentage of protocol fees and
					the ability to vote on governance proposals. Tokens locked into veBAO will not be subject to any slashing penalty.
				</Typography>
			</>
		),
	},
	{
		id: 2,
		name: 'Claim Now',
		shortDesc: 'Claim your unlocked BAO.',
		desc: (
			<>
				<div className='flex flex-col'></div>
				<div className='flex flex-col'>
					<div className='flex flex-row'>
						<Typography variant='p'>
							Choose to perform a liquid distribution over 3 years. Over the course of the 3 years, 100% of your locked tokens will be
							distributed to you along the distribution curve defined below. You can claim as many times as you would like throughout this
							distribution, as long as you have accrued more tokens since your last claim. All tokens claimed using this method are not
							subject to any slashing penalty. You may still choose to lock into veBAO or end your distribution at any time during the 3
							year period.
						</Typography>
					</div>
						<div className='flex flex-col m-auto'>
							<Latex>{`\\(P_u = Percent \\ Unlocked \\)`}</Latex>
							<Latex>{`\\(x = Days \\)`}</Latex>
							<div className='h-2' />
							<Latex>{`\\(P_{u}(x) \\begin{cases} \\begin{matrix} (\\frac{2x}{219})^2 & 0 \\leq x \\leq 1095 \\\\ 100 & x > 1095 \\end{matrix} \\end{cases} \\)`}</Latex>
						</div>
						<div className='flex w-1/2 flex-col items-center justify-center mt-4 m-auto'>
							<img
								src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/672bf049e86f377e5129b84931bba7933e324bcc.png'
								className='h-[200px] rounded'
							/>
							<Typography variant='xs' className='mt-2 text-center text-text-200'>
								A graph showing how BAO will unlock over time following.
							</Typography>
						</div>
					</div>
			</>
		),
	},
	{
		id: 3,
		name: 'End Distribution',
		shortDesc: 'End your distribution.',
		desc: (
			<>
				<div className='flex flex-col'>
					<Typography variant='p'>
						Users that perform a liquid distribution can choose to end their distribution early at any time after the distribution starts. A
						large slashing penalty will be applied to the tokens unlocked early, while all tokens already unlocked have no slash fee
						applied. The slash fee is based on the slash rate function defined below which will end their distribution and allow them to
						receive the rest of their tokens (minus slash fee) immediately.
					</Typography>
					<Typography variant='lg' className='mt-2 mb-2 font-bold'>
						Slash Function
					</Typography>
					<code>X = days since start of distribution</code>
					<code>{'0 <= X <= 365 || (100 -.01369863013x)'}</code>
					<code>{'365 <X <= 1095 || 95'}</code>
					<Typography variant='p'>
						The slash function starts at the same date the address selects to start their BAO distribution. The slash function starts at
						100% on day 0, and approaches a constant 95% slash on day 365 and thereafter. On the day that the user chooses to end their
						distribution early, the slash function defines how much of their remaining distribution will be slashed. The user will receive
						the remainder of this percentage of their remaining distribution immediately.
					</Typography>
					<div className='m-auto mt-2 flex w-1/2 flex-col items-center justify-center'>
						<img
							src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/d0683e4c31a1d5cbfdf4a1a23f76325ca884ee43.gif'
							className='max-h-[400px] w-min rounded'
						/>
						<Typography variant='xs' className='mt-2 text-center text-text-200'>
							In the graph above, the blue points are the state of both curves respectively. The orange point is the percentage of their
							total distribution that the user will be able to claim if they choose to end their distribution at that point.
						</Typography>
					</div>
				</div>
			</>
		),
	},
]
const Distribution: React.FC = () => {
	const [selectedOption, setSelectedOption] = useState(options[0])
	const locks = useLockedEarnings()

	return (
		<>
			<div className='border-b border-text-100 pb-5'>
				<Typography variant='lg' className='text-lg font-medium leading-6 text-text-200'>
					Select Your Distribution Method
				</Typography>
				<Typography variant='p' className='mt-2 text-text-100'>
					Locked Bao holders have three options they can take with their locked positions. Any distribution will only begin once manually
					initiated by the wallet owner. Please read the descriptions below very carefully. If you have any questions, please join our{' '}
					<a href='https://discord.gg/BW3P62vJXT' target='_blank' rel='noreferrer noopener' className='font-medium hover:text-text-400'>
						Discord
					</a>{' '}
					community!
				</Typography>
			</div>
			<div className='flex flex-row'>
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
				<div className='mt-2 mb-1 flex w-full items-center justify-end gap-1'>
					<Typography className='px-2 text-sm text-text-200'>Your Locked BAO Balance</Typography>
					<div className='flex h-8 flex-row items-center justify-center gap-2 rounded border border-primary-400 bg-primary-100 px-2 py-4'>
						<Image src='/images/tokens/BAO.png' height={24} width={24} alt='BAO' />
						<Typography className='font-bold'>{getDisplayBalance(locks)}</Typography>
					</div>
				</div>
			</div>
			<div className='flex flex-row rounded bg-primary-100 p-4'>{selectedOption.desc}</div>
		</>
	)
}

export default Distribution
