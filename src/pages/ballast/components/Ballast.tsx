import Config from '@/bao/lib/config'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Typography from '@/components/Typography'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import { useAccountBalances } from '@/hooks/vaults/useBalances'
import useBallastInfo from '@/hooks/vaults/useBallastInfo'
import { useVaults } from '@/hooks/vaults/useVaults'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { Fragment, useMemo, useState } from 'react'
import BallastButton from './BallastButton'
import { isDesktop } from 'react-device-detect'

export const Ballast = () => {
	const [selectedOption, setSelectedOption] = useState('baoUSD')
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->baoUSD | true = baoUSD->DAI
	const [inputVal, setInputVal] = useState('')
	const { account } = useWeb3React()
	const wethBalance = useTokenBalance(Config.addressMap.WETH)
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const baoETHBalance = useTokenBalance(Config.addressMap.baoETH)
	const ballastInfo = useBallastInfo(selectedOption)
	const accountBalances = useAccountBalances(selectedOption)
	const _vaults = useVaults(selectedOption)

	const synth = useMemo(() => {
		return _vaults?.find(vault => vault.isSynth)
	}, [_vaults])

	const aInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
					<Typography variant='sm' className='font-bold text-baoRed'>
						Balance:
					</Typography>
					<Typography variant='sm' className='font-bold'>
						{selectedOption === 'baoUSD' ? `${getDisplayBalance(daiBalance)}` : `${getDisplayBalance(wethBalance)}`}
						{selectedOption === 'baoUSD' ? (
							<Image className='z-10 ml-1 inline-block select-none' src='/images/tokens/DAI.png' alt='DAI' width={16} height={16} />
						) : (
							<Image className='z-10 ml-1 inline-block select-none' src='/images/tokens/WETH.png' alt='WETH' width={16} height={16} />
						)}
					</Typography>
				</div>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography variant='sm' className='font-bold text-baoRed'>
						Reserves:
					</Typography>
					<Typography variant='sm' className='font-bold'>
						{ballastInfo ? getDisplayBalance(ballastInfo.reserves) : <Loader />}
					</Typography>
				</div>
			</div>
			<Input
				onSelectMax={() => setInputVal(formatEther(selectedOption === 'baoUSD' ? daiBalance : wethBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={swapDirection}
				label={
					<div className='flex flex-row items-center rounded-r-3xl bg-baoBlack pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${selectedOption === 'baoUSD' ? 'DAI' : 'WETH'}.png`}
								height={32}
								width={32}
								alt={selectedOption === 'baoUSD' ? 'DAI' : 'WETH'}
							/>
						</div>
					</div>
				}
				className='m-auto'
			/>
		</>
	)

	const bInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
					<Typography variant='sm' className='font-bold text-baoRed'>
						Balance:
					</Typography>
					<Typography variant='sm' className='font-bold'>
						{selectedOption === 'baoUSD' ? `${getDisplayBalance(baoUSDBalance)}` : `${getDisplayBalance(baoETHBalance)}`}
						{selectedOption === 'baoUSD' ? (
							<Image className='z-10 ml-1 inline-block select-none' src='/images/tokens/baoUSD.png' alt='baoUSD' width={16} height={16} />
						) : (
							<Image className='z-10 ml-1 inline-block select-none' src='/images/tokens/baoETH.png' alt='baoETH' width={16} height={16} />
						)}
					</Typography>
				</div>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography variant='sm' className='font-bold text-baoRed'>
						{isDesktop ? 'Mint' : ''} Limit:
					</Typography>
					<Typography variant='sm' className='font-bold'>
						{ballastInfo ? getDisplayBalance(ballastInfo.supplyCap) : <Loader />}
					</Typography>
				</div>
			</div>
			<div className='m-auto flex w-full rounded-3xl border border-baoWhite border-opacity-20 bg-baoBlack'>
				<Input
					onSelectMax={() => setInputVal(formatEther(selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString())}
					onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
					// Fee calculation not ideal, fix.
					value={
						!swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
					}
					disabled={!swapDirection}
					placeholder={`${formatEther(selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString()}`}
					className='m-auto ml-1 !rounded-3xl !border-0'
				/>
				<Listbox value={selectedOption} onChange={setSelectedOption}>
					{({ open }) => (
						<div className='flex-col'>
							<Listbox.Button className={(classNames(open ? 'text-baoRed' : 'text-baoWhite'), 'inline-flex')}>
								<div className='m-2 flex w-40 rounded-full border-none bg-baoWhite bg-opacity-5 px-1 duration-300 hover:bg-transparent-300'>
									<div className='m-auto w-auto py-1 text-baoWhite lg:py-2'>
										{selectedOption === '' ? (
											<Typography>Select a synth</Typography>
										) : (
											<div className='h-full items-start'>
												<div className='mr-2 inline-block'>
													<Image
														className='z-10 inline-block select-none'
														src={`/images/tokens/${selectedOption}.png`}
														alt={`baoUSD`}
														width={20}
														height={20}
													/>
												</div>
												<span className='inline-block text-left align-middle'>
													<Typography variant='base' className='font-bakbak'>
														{selectedOption}
													</Typography>
												</span>
											</div>
										)}
									</div>
									<div className='m-auto ml-0 w-auto justify-end text-end'>
										<ChevronDownIcon className='h-5 w-5 text-baoRed' aria-hidden='true' />
									</div>
								</div>
							</Listbox.Button>

							<Transition show={open} as={Fragment} leave='transition ease-in duration-100' leaveFrom='opacity-100' leaveTo='opacity-0'>
								<Listbox.Options className='absolute inset-x-20 z-10 -mt-1 ml-3 w-[260px] origin-left overflow-hidden rounded-3xl border border-baoWhite/20 bg-baoBlack p-2 shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none lg:inset-x-auto'>
									<div className='grid grid-cols-4 p-2 font-bakbak font-normal text-baoWhite'>
										<div className='col-span-2'>
											<Typography variant='lg'>Asset</Typography>
										</div>
										<div className='col-span-2'>
											<Typography variant='lg' className='text-right'>
												Balance
											</Typography>
										</div>
									</div>
									<Listbox.Option
										key={'baoUSD'}
										className={({ active }) =>
											classNames(
												active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
												'cursor-pointer select-none rounded-3xl border border-baoBlack p-4 text-sm',
											)
										}
										value={'baoUSD'}
									>
										{({ selected, active }) => (
											<div className='mx-0 my-auto grid h-full grid-cols-6 items-center gap-4'>
												<div className='col-span-4'>
													<Image
														className='z-10 inline-block select-none'
														src={`/images/tokens/baoUSD.png`}
														alt='baoUSD'
														width={24}
														height={24}
													/>
													<span className='ml-2 inline-block text-left align-middle'>
														<Typography variant='lg' className='font-bakbak'>
															baoUSD
														</Typography>
													</span>
												</div>
												<div className='col-span-2'>
													<Typography variant='lg' className='text-right align-middle font-bakbak'>
														{account && accountBalances && synth
															? getDisplayBalance(
																	accountBalances.find(balance => balance.address === synth.underlyingAddress).balance,
																	synth.underlyingDecimals,
															  )
															: '-'}
													</Typography>
												</div>
											</div>
										)}
									</Listbox.Option>
									<Listbox.Option
										key={'baoETH'}
										className={({ active }) =>
											classNames(
												active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
												'cursor-pointer select-none rounded-3xl border border-baoBlack p-4 text-sm',
											)
										}
										value={'baoETH'}
									>
										{({ selected, active }) => (
											<div className='mx-0 my-auto grid h-full grid-cols-4 items-center gap-4'>
												<div className='col-span-2'>
													<Image
														className='z-10 inline-block select-none'
														src={`/images/tokens/baoETH.png`}
														alt='baoETH'
														width={24}
														height={24}
													/>
													<span className='ml-2 inline-block text-left align-middle'>
														<Typography variant='lg' className='font-bakbak'>
															baoETH
														</Typography>
													</span>
												</div>
												<div className='col-span-2'>
													<Typography variant='lg' className='text-right align-middle font-bakbak'>
														{account && accountBalances && synth
															? getDisplayBalance(
																	accountBalances.find(balance => balance.address === synth.underlyingAddress).balance,
																	synth.underlyingDecimals,
															  )
															: '-'}
													</Typography>
												</div>
											</div>
										)}
									</Listbox.Option>
								</Listbox.Options>
							</Transition>
						</div>
					)}
				</Listbox>
			</div>
		</>
	)

	return (
		<>
			<Card className='glassmorphic-card p-8'>
				<Card.Body>
					{swapDirection ? bInput : aInput}
					<div className='mt-4 block select-none text-center'>
						<span
							className='m-auto mb-2 flex w-fit items-center justify-center gap-1 rounded-full border-none bg-baoRed p-2 hover:cursor-pointer hover:bg-baoRed hover:bg-opacity-80'
							onClick={() => setSwapDirection(!swapDirection)}
						>
							<FontAwesomeIcon icon={faSync} size='sm' className='m-auto' />
							<Typography variant='sm' className='inline font-bold'>
								Fee: {ballastInfo ? `${(100 / 10000) * 100}%` : <Loader />}
							</Typography>
						</span>
					</div>
					{swapDirection ? aInput : bInput}
					<div className='h-4' />
				</Card.Body>
				<Card.Actions>
					<BallastButton
						vaultName={selectedOption}
						swapDirection={swapDirection}
						inputVal={inputVal}
						maxValues={{
							buy: selectedOption === 'baoUSD' ? daiBalance : wethBalance,
							sell: selectedOption === 'baoUSD' ? baoUSDBalance : baoETHBalance,
						}}
						supplyCap={ballastInfo ? ballastInfo.supplyCap : BigNumber.from(0)}
						reserves={ballastInfo ? ballastInfo.reserves : BigNumber.from(0)}
					/>
				</Card.Actions>
			</Card>
		</>
	)
}

export default Ballast
