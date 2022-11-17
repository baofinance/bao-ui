/* eslint-disable prettier/prettier */
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import 'katex/dist/katex.min.css'
import Image from 'next/future/image'
import React, { Fragment, useState } from 'react'
import Claim from './Claim'
import End from './End'
import Migrate from './Migrate'

const options = [
	{
		id: 1,
		name: 'Migrate to veBAO',
		shortDesc: 'Migrate your locked BAOv1 to veBAO.',
	},
	{
		id: 2,
		name: 'Claim Now',
		shortDesc: 'Claim your unlocked BAO.',
	},
	{
		id: 3,
		name: 'End Distribution',
		shortDesc: 'End your distribution.',
	},
]

const Migration: React.FC = () => {
	const [selectedOption, setSelectedOption] = useState(options[0])
	const { handleTx } = useTransactionHandler()

	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const { account, chainId } = useWeb3React()
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
			enabled: !!distribution && !!account,
		},
	)
	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	//console.log('User has started distrubtion.', distributionInfo && distributionInfo.dateStarted.gt(0))

	const totalLockedBAO = merkleLeaf ? merkleLeaf.amount : '0'
	const dateStarted = distributionInfo ? distributionInfo.dateStarted : 0

	//console.log('Date Started', dateStarted.toString())
	//console.log('Merkle Leaf', merkleLeaf)
	return (
		<div className='flex flex-col items-center'>
			<div className='w-3/5 pt-4'>
				{distributionInfo && distributionInfo.dateStarted.gt(0) ? (
					<>
						<div className='border-b border-text-100 pb-5'>
							<Typography variant='lg' className='text-lg font-medium leading-6 text-text-200'>
								Select Your Distribution Method
							</Typography>
							<Typography variant='p' className='mt-2 text-text-100'>
								Locked Bao holders have three options they can take with their locked positions. Any distribution will only begin once
								manually initiated by the wallet owner. Please read the descriptions below very carefully. If you have any questions, please
								join our{' '}
								<a href='https://discord.gg/BW3P62vJXT' target='_blank' rel='noreferrer noopener' className='font-medium hover:text-text-400'>
									Discord
								</a>{' '}
								community!
							</Typography>
						</div>
						<div className='flex flex-row'>
							<div className='my-4 flex w-full flex-col'>
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

												<Transition
													show={open}
													as={Fragment}
													leave='transition ease-in duration-100'
													leaveFrom='opacity-100'
													leaveTo='opacity-0'
												>
													<Listbox.Options className='absolute z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-primary-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
														{options.map(option => (
															<Listbox.Option
																key={option.name}
																className={({ active }) =>
																	classNames(
																		active ? 'bg-primary-100 text-text-400' : 'text-text-100',
																		'cursor-default select-none p-4 text-sm',
																	)
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
									<Typography className='font-bold'>{getDisplayBalance(totalLockedBAO * 0.001)}</Typography>
								</div>
							</div>
						</div>
						<div className='mb-4 flex flex-col rounded bg-primary-100 p-4'>
							{selectedOption.id == 1 && <Migrate />}
							{selectedOption.id == 2 && <Claim />}
							{selectedOption.id == 3 && <End />}
						</div>
					</>
				) : (
					<div className='flex flex-col items-center'>
						<div className='md:w-1/2'>
							<div className='mb-5 border-b border-text-100 pb-5'>
								<Typography variant='xl' className='font-medium leading-10 text-text-200'>
									Start Your Distribution
								</Typography>
								<Typography variant='p' className='mt-2 text-text-100 text-lg leading-normal'>
									Locked Bao holders have three options they can take with their locked positions. Any distribution will only begin once
									manually initiated by the wallet owner. Please read the descriptions below very carefully. If you have any questions, please
									join our{' '}
									<a
										href='https://discord.gg/BW3P62vJXT'
										target='_blank'
										rel='noreferrer noopener'
										className='font-medium hover:text-text-400'
									>
										Discord
									</a>{' '}
									community!
								</Typography>
							</div>
							<div className='flex flex-col items-center'>
								<Button
									className='bg-primary-500'
									onClick={async () => {
										const startDistribution = distribution.startDistribution(merkleLeaf.proof, merkleLeaf.amount)
										handleTx(startDistribution, `Start Distribution`)
									}}
								>
									Start Distribution
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default Migration
