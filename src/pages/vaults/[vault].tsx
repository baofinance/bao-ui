import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import Button, { NavButtons } from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { ListHeader } from '@/components/List'
import Loader, { PageLoader } from '@/components/Loader'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import { AccountLiquidity, useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { Balance, useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import useBallastInfo from '@/hooks/vaults/useBallastInfo'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import { useAccountVaults, useVaults } from '@/hooks/vaults/useVaults'
import { providerKey } from '@/utils/index'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react/components/Accordion'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber, FixedNumber } from 'ethers'
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import BallastButton from './components/BallastButton'
import VaultBorrowModal from './components/Modals/BorrowModal'
import VaultSupplyModal from './components/Modals/SupplyModal'
import { VaultDetails } from './components/Stats'
import VaultButton from './components/VaultButton'
import Badge from '@/components/Badge'

export async function getStaticPaths() {
	return {
		paths: [{ params: { vault: 'baoUSD' } }, { params: { vault: 'baoETH' } }],
		fallback: false, // can also be true or 'blocking'
	}
}

export async function getStaticProps({ params }: { params: any }) {
	const { vault } = params

	return {
		props: {
			vaultName: vault,
		},
	}
}

const Vault: NextPage<{
	vaultName: string
}> = ({ vaultName }) => {
	const { account } = useWeb3React()
	const _vaults = useVaults(vaultName)
	const accountBalances = useAccountBalances(vaultName)
	const accountVaults = useAccountVaults(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)
	const balances = useAccountBalances(vaultName)
	const { prices } = useVaultPrices(vaultName)

	const [val, setVal] = useState<string>('')
	const operations = ['Mint', 'Repay', 'Ballast']
	const [operation, setOperation] = useState(operations[0])

	const collateral = useMemo(() => {
		if (!(_vaults && supplyBalances)) return
		return _vaults
			.filter(vault => !vault.isSynth)
			.sort((a, b) => {
				void a
				return supplyBalances.find(balance => balance.address.toLowerCase() === b.vaultAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [_vaults, supplyBalances])

	const synth = useMemo(() => {
		if (!(_vaults && borrowBalances)) return
		return _vaults.find(vault => vault.isSynth)
	}, [_vaults, borrowBalances])

	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const borrowed = useMemo(
		() => synth && borrowBalances.find(balance => balance.address === synth.vaultAddress).balance,
		[borrowBalances, synth],
	)

	const max = () => {
		switch (operation) {
			case 'Mint':
				return prices && accountLiquidity && synth.price.gt(0)
					? BigNumber.from(
							FixedNumber.from(formatUnits(accountLiquidity && accountLiquidity.usdBorrowable)).divUnsafe(
								FixedNumber.from(formatUnits(synth.price)),
							),
					  )
					: BigNumber.from(0)
			case 'Repay':
				if (borrowBalances && balances) {
					const borrowBalance = borrowBalances.find(_balance => _balance.address.toLowerCase() === synth.vaultAddress.toLowerCase()).balance
					const walletBalance = balances.find(_balance => _balance.address.toLowerCase() === synth.underlyingAddress.toLowerCase()).balance
					return walletBalance.lt(borrowBalance) ? walletBalance : borrowBalance
				} else {
					return BigNumber.from(0)
				}
		}
	}

	const depositMax = () => {
		return balances
			? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
			: BigNumber.from(0)
	}

	const maxLabel = () => {
		switch (operation) {
			case 'Mint':
				return 'Max Mint'
			case 'Repay':
				return 'Max Repay'
		}
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const synthBalance = useMemo(
		() =>
			synth && balances && balances.find(_balance => _balance.address === synth.underlyingAddress)
				? balances.find(_balance => _balance.address === synth.underlyingAddress).balance
				: 0,
		[balances, synth],
	)

	// Ballast
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->baoUSD | true = baoUSD->DAI
	const [inputVal, setInputVal] = useState('')
	const wethBalance = useTokenBalance(Config.addressMap.WETH)
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const baoETHBalance = useTokenBalance(Config.addressMap.baoETH)
	const ballastInfo = useBallastInfo(vaultName)

	const aInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Balance:
					</Typography>
					<Typography variant='sm'>
						{vaultName === 'baoUSD' ? `${getDisplayBalance(daiBalance)} DAI` : `${getDisplayBalance(wethBalance)} WETH`}
					</Typography>
				</div>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Reserves:
					</Typography>
					<Typography variant='sm'>{ballastInfo ? getDisplayBalance(ballastInfo.reserves) : <Loader />}</Typography>
				</div>
			</div>
			<Input
				onSelectMax={() => setInputVal(formatEther(vaultName === 'baoUSD' ? daiBalance : wethBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${vaultName === 'baoUSD' ? 'DAI' : 'WETH'}.png`}
								height={32}
								width={32}
								alt={vaultName === 'baoUSD' ? 'DAI' : 'WETH'}
							/>
						</div>
					</div>
				}
			/>
		</>
	)

	const bInput = (
		<>
			<div className='flex w-full flex-row'>
				<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Balance:
					</Typography>
					<Typography variant='sm'>
						{vaultName === 'baoUSD' ? `${getDisplayBalance(baoUSDBalance)} baoUSD` : `${getDisplayBalance(baoETHBalance)} baoETH`}
					</Typography>
				</div>
				<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
					<Typography variant='sm' className='text-baoRed'>
						Mint Limit:
					</Typography>
					<Typography variant='sm'>{ballastInfo ? getDisplayBalance(ballastInfo.supplyCap) : <Loader />}</Typography>
				</div>
			</div>
			<Input
				onSelectMax={() => setInputVal(formatEther(vaultName === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					!swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={!swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}.png`}
								height={32}
								width={32}
								alt={vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}
							/>
						</div>
					</div>
				}
			/>
		</>
	)

	const [selectedOption, setSelectedOption] = useState('ETH')
	const asset =
		collateral &&
		(collateral.length
			? collateral.find(asset => asset.underlyingSymbol === selectedOption)
			: collateral.find(asset => asset.underlyingSymbol === 'ETH'))

	const baskets = useBaskets()
	const basket =
		asset &&
		asset.isBasket === true &&
		baskets &&
		baskets.find(basket => basket.address.toLowerCase() === asset.underlyingAddress.toLowerCase())

	const composition = useComposition(asset && basket && asset.isBasket === true && basket)
	const avgBasketAPY =
		asset && asset.isBasket && composition
			? (composition
					.sort((a, b) => (a.percentage.lt(b.percentage) ? 1 : -1))
					.map(component => {
						return component.apy
					})
					.reduce(function (a, b) {
						return a + parseFloat(formatUnits(b))
					}, 0) /
					composition.length) *
			  100
			: 0

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances && asset && supplyBalances.find(balance => balance.address === asset.vaultAddress)
		const supplyBalance = supply && supply.balance && (supply.balance === undefined ? BigNumber.from(0) : supply.balance)
		if (exchangeRates && asset && exchangeRates[asset.vaultAddress] === undefined) return BigNumber.from(0)
		return supplyBalance && exchangeRates && decimate(supplyBalance.mul(exchangeRates[asset.vaultAddress]))
	}, [supplyBalances, exchangeRates, asset])

	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				{collateral &&
				synth &&
				accountBalances &&
				accountLiquidity &&
				accountVaults &&
				supplyBalances &&
				borrowBalances &&
				exchangeRates ? (
					<>
						<div className='bg-primary-100 hover:bg-primary-200 mb-4 mt-6 flex h-fit w-fit flex-row gap-4 rounded border-0 p-3 duration-200'>
							<Link href='/'>
								<FontAwesomeIcon icon={faArrowLeft} />
							</Link>
						</div>
						<div className='bg-primary-100 mb-4 flex w-full flex-row gap-4 rounded border-0 p-3'>
							<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
								<Image
									src={`/images/tokens/${synth.icon}`}
									alt={`${synth.underlyingSymbol}`}
									width={32}
									height={32}
									className='inline-block select-none'
								/>
								<span className='inline-block text-left align-middle'>
									<Typography className='ml-2 text-lg font-bold leading-5'>{synth.underlyingSymbol}</Typography>
								</span>
							</div>
							<div className='mx-auto my-0 flex w-full flex-row items-center justify-end text-end align-middle'>
								<Badge className='rounded-full bg-baoRed align-middle'>
									<Typography className='ml-2 inline-block font-bold leading-5'>{getDisplayBalance(synth.borrowApy)}%</Typography>
									<Typography className='ml-1 inline-block font-bold leading-5 text-baoWhite'>APY</Typography>
								</Badge>
							</div>
						</div>
						<div className='grid w-full grid-cols-6 gap-16 rounded-lg'>
							<div className='col-span-3'>
								<div className='flex w-full gap-4 rounded-full border border-baoRed bg-baoWhite bg-opacity-5 p-1'>
									<Listbox value={selectedOption} onChange={setSelectedOption}>
										{({ open }) => (
											<>
												<div>
													<Listbox.Button className={(classNames(open ? 'text-baoRed' : 'text-baoWhite'), 'inline-flex')}>
														<div className='m-1 flex w-36 rounded-full border-none bg-baoWhite bg-opacity-5 p-1 hover:bg-transparent-300'>
															<div className='w-full py-2 text-baoWhite'>
																{selectedOption === '' ? (
																	<Typography>Select a collateral</Typography>
																) : (
																	<div className='h-full items-start'>
																		<div className='mr-2 inline-block'>
																			<Image
																				className='z-10 inline-block select-none'
																				src={asset && `/images/tokens/${asset.underlyingSymbol}.png`}
																				alt={asset && asset.underlyingSymbol}
																				width={24}
																				height={24}
																			/>
																		</div>
																		<span className='inline-block text-left align-middle'>
																			<Typography variant='lg' className='font-bakbak'>
																				{asset && asset.underlyingSymbol}
																			</Typography>
																		</span>
																	</div>
																)}
															</div>
															<div className='my-auto mr-3 w-auto justify-end text-end'>
																<ChevronDownIcon className='h-5 w-5 text-baoRed' aria-hidden='true' />
															</div>
														</div>
													</Listbox.Button>

													<Transition
														show={open}
														as={Fragment}
														leave='transition ease-in duration-100'
														leaveFrom='opacity-100'
														leaveTo='opacity-0'
													>
														<Listbox.Options className='absolute z-10 ml-3 -mt-1 w-auto origin-top-right overflow-hidden rounded-lg bg-baoBlack p-2 shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none'>
															<div className='grid grid-cols-6 p-2'>
																<div className='col-span-2'>
																	<Typography variant='lg' className='font-bakbak'>
																		Asset
																	</Typography>
																</div>
																<div className='col-span-2'>
																	<Typography variant='lg' className='text-center font-bakbak'>
																		APY
																	</Typography>
																</div>
																<div className='col-span-2'>
																	<Typography variant='lg' className='text-right font-bakbak'>
																		Balance
																	</Typography>
																</div>
															</div>
															{collateral.length ? (
																collateral.map((asset: ActiveSupportedVault) => (
																	<Listbox.Option
																		key={asset.underlyingSymbol}
																		className={({ active }) =>
																			classNames(
																				active ? 'border !border-baoRed bg-baoWhite bg-opacity-5 text-baoRed' : 'text-baoWhite',
																				'cursor-pointer select-none rounded-lg border border-baoBlack p-4 text-sm',
																			)
																		}
																		value={asset.underlyingSymbol}
																	>
																		{({ selected, active }) => (
																			<div className='mx-0 my-auto grid h-full grid-cols-6 items-center gap-4'>
																				<div className='col-span-2'>
																					<Image
																						className='z-10 inline-block select-none'
																						src={`/images/tokens/${asset.underlyingSymbol}.png`}
																						alt={asset.underlyingSymbol}
																						width={24}
																						height={24}
																					/>
																					<span className='ml-2 inline-block text-left align-middle'>
																						<Typography variant='lg' className='font-bakbak'>
																							{asset.underlyingSymbol}
																						</Typography>
																					</span>
																				</div>
																				<div className='col-span-2'>
																					<Typography variant='lg' className='text-center align-middle font-bakbak'>
																						{asset.isBasket && avgBasketAPY ? getDisplayBalance(avgBasketAPY, 0, 2) + '%' : '-'}
																					</Typography>
																				</div>
																				<div className='col-span-2'>
																					<Typography variant='lg' className='text-right align-middle font-bakbak'>
																						{account
																							? getDisplayBalance(
																									accountBalances.find(balance => balance.address === asset.underlyingAddress).balance,
																									asset.underlyingDecimals,
																							  )
																							: '-'}
																					</Typography>
																				</div>
																			</div>
																		)}
																	</Listbox.Option>
																))
															) : (
																<Typography>Select a collateral</Typography>
															)}
														</Listbox.Options>
													</Transition>
												</div>
											</>
										)}
									</Listbox>
									<Input
										value={val}
										onChange={handleChange}
										onSelectMax={() => setVal(formatUnits(depositMax(), asset.underlyingDecimals))}
										className='mt-1'
									/>
									<div className='w-64 p-1'>
										<VaultButton
											vaultName={vaultName}
											operation={'Supply'}
											asset={asset}
											val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
											isDisabled={!val || (val && parseUnits(val, asset.underlyingDecimals).gt(depositMax()))}
										/>
									</div>
								</div>
								<Typography variant='xl' className='p-4 text-center font-bakbak'>
									Collateral Info
								</Typography>
								<StatBlock
									label=''
									stats={[
										{
											label: 'Total Supplied',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														{getDisplayBalance(asset.supplied, asset.underlyingDecimals)} {asset.underlyingSymbol}
													</Typography>
													<Badge className='ml-2 inline-block rounded-full bg-baoRed align-middle'>
														${getDisplayBalance(decimate(asset.supplied.mul(asset.price)))}
													</Badge>
												</>
											),
										},
										{
											label: 'Your Supply',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														{getDisplayBalance(suppliedUnderlying, asset.underlyingDecimals)}
														{asset.underlyingSymbol}
													</Typography>
													<Badge className='ml-2 inline-block rounded-full bg-baoRed align-middle'>
														${getDisplayBalance(decimate(suppliedUnderlying.mul(asset.price)))}
													</Badge>
												</>
											),
										},
										{
											label: 'Wallet Balance',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														{getDisplayBalance(
															accountBalances.find(balance => balance.address === asset.underlyingAddress).balance,
															asset.underlyingDecimals,
														)}{' '}
														{asset.underlyingSymbol}
													</Typography>
													<Badge className='ml-2 inline-block rounded-full bg-baoRed align-middle'>
														$
														{getDisplayBalance(
															decimate(
																accountBalances.find(balance => balance.address === asset.underlyingAddress).balance.mul(asset.price),
															),
														)}
													</Badge>
												</>
											),
										},
										{
											label: 'Collateral Factor',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														{getDisplayBalance(asset.collateralFactor.mul(100), 18, 0)}%
													</Typography>
												</>
											),
										},
										{
											label: 'Initial Margin Factor',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														{getDisplayBalance(asset.imfFactor.mul(100), 18, 0)}%
													</Typography>
												</>
											),
										},
										{
											label: 'Reserve Factor',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														{getDisplayBalance(asset.reserveFactor.mul(100), 18, 0)}%
													</Typography>
												</>
											),
										},
										{
											label: 'Total Reserves',
											value: (
												<>
													<Typography className='inline-block align-middle font-bold'>
														${getDisplayBalance(asset.totalReserves.mul(asset.price), 18 + asset.underlyingDecimals)}
													</Typography>
												</>
											),
										},
									]}
								/>
								<div>OPEN POSITIONS</div>
							</div>

							<div className='col-span-3'>
								<div className='flex w-full gap-4 rounded-full border border-baoRed bg-baoWhite bg-opacity-5 p-1'>
									<div>
										<div className='m-1 flex w-36 justify-center rounded-full border-none bg-baoWhite bg-opacity-5 p-1'>
											<div className='justify-center py-2 text-baoWhite'>
												<div className='m-auto h-full justify-center'>
													<div className='mr-2 inline-block'>
														<Image
															className='z-10 inline-block select-none'
															src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
															alt={synth && synth.underlyingSymbol}
															width={24}
															height={24}
														/>
													</div>
													<span className='inline-block text-left align-middle'>
														<Typography variant='lg' className='font-bakbak'>
															{synth && synth.underlyingSymbol}
														</Typography>
													</span>
												</div>
											</div>
										</div>
									</div>

									<Input
										value={val}
										onChange={handleChange}
										onSelectMax={() => setVal(formatUnits(depositMax(), asset.underlyingDecimals))}
										className='mt-1'
									/>
									<div className='w-64 p-1'>
										<VaultButton
											vaultName={vaultName}
											operation={'Mint'}
											asset={asset}
											val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
											isDisabled={
												!val ||
												(val && parseUnits(val, asset.underlyingDecimals).gt(max())) ||
												// FIXME: temporarily limit minting/borrowing to 5k baoUSD & 3 baoETH.
												(val &&
													borrowed.lt(parseUnits(vaultName === 'baoUSD' ? '5000' : '3')) &&
													parseUnits(val, asset.underlyingDecimals).lt(parseUnits(vaultName === 'baoUSD' ? '5000' : '3')) &&
													operation === 'Mint')
											}
										/>
									</div>
								</div>

								{account && (
									<>
										<VaultStats asset={synth} amount={val} vaultName={vaultName} />
									</>
								)}
							</div>
						</div>

						<div className='flex flex-row gap-4'>
							<div className='mt-8 flex w-1/2 flex-col'>
								<Card.Options className='mt-0'>
									<NavButtons options={operations} active={operation} onClick={setOperation} />
								</Card.Options>
								{operation !== 'Ballast' ? (
									<>
										<Card.Body>
											<div className='mb-4 flex flex-col items-center justify-center'>
												<div className='flex w-full flex-row'>
													<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
														<Typography variant='sm' className='text-baoRed'>
															Wallet:
														</Typography>
														<Typography variant='sm'>{`${getDisplayBalance(synthBalance)}`}</Typography>
													</div>
													<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
														<Typography variant='sm' className='text-baoRed'>
															{`${maxLabel()}:`}
														</Typography>
														<Typography variant='sm'>{`${getDisplayBalance(max(), synth.underlyingDecimals)} ${
															synth.underlyingSymbol
														}`}</Typography>
													</div>
												</div>
												<Input
													value={val}
													onChange={handleChange}
													onSelectMax={() => setVal(formatUnits(max(), synth.underlyingDecimals))}
													label={
														<div className='flex flex-row items-center pl-2 pr-4'>
															<div className='flex w-6 justify-center'>
																<Image
																	src={`/images/tokens/${synth.icon}`}
																	width={32}
																	height={32}
																	alt={synth.symbol}
																	className='block h-6 w-6 align-middle'
																/>
															</div>
														</div>
													}
												/>
											</div>
											<VaultButton
												vaultName={vaultName}
												operation={operation}
												asset={synth}
												val={val ? parseUnits(val, synth.underlyingDecimals) : BigNumber.from(0)}
												isDisabled={
													!val ||
													(val && parseUnits(val, synth.underlyingDecimals).gt(max())) ||
													// FIXME: temporarily limit minting/borrowing to 5k baoUSD.
													(val &&
														borrowed.lt(parseUnits(vaultName === 'baoUSD' ? '5000' : '3')) &&
														parseUnits(val, synth.underlyingDecimals).lt(parseUnits(vaultName === 'baoUSD' ? '5000' : '3')) &&
														operation === 'Mint')
												}
											/>
										</Card.Body>
									</>
								) : (
									<>
										<Card.Body>
											{swapDirection ? bInput : aInput}
											<div className='mt-4 block select-none text-center'>
												<span
													className='hover:bg-primary-400 m-auto mb-2 flex w-fit items-center justify-center gap-1 rounded-full border-none bg-transparent-100 p-2 text-lg hover:cursor-pointer'
													onClick={() => setSwapDirection(!swapDirection)}
												>
													<FontAwesomeIcon icon={faSync} size='xs' className='m-auto' />
													<Typography variant='xs' className='inline'>
														Fee: {ballastInfo ? `${(100 / 10000) * 100}%` : <Loader />}
													</Typography>
												</span>
											</div>
											{swapDirection ? aInput : bInput}
											<div className='h-4' />
										</Card.Body>
										<Card.Actions>
											<BallastButton
												vaultName={vaultName}
												swapDirection={swapDirection}
												inputVal={inputVal}
												maxValues={{
													buy: vaultName === 'baoUSD' ? daiBalance : wethBalance,
													sell: vaultName === 'baoUSD' ? baoUSDBalance : baoETHBalance,
												}}
												supplyCap={ballastInfo ? ballastInfo.supplyCap : BigNumber.from(0)}
												reserves={ballastInfo ? ballastInfo.reserves : BigNumber.from(0)}
											/>
										</Card.Actions>
									</>
								)}
							</div>
						</div>
						<VaultBorrowModal
							vaultName={vaultName}
							asset={synth}
							show={showBorrowModal}
							onHide={() => {
								setShowBorrowModal(false)
								setIsOpen(true)
							}}
						/>
					</>
				) : (
					<PageLoader block />
				)}
			</>{' '}
		</>
	)
}

type CollateralListProps = {
	collateral: ActiveSupportedVault[]
	vaultName: string
}

export const CollateralList: React.FC<CollateralListProps> = ({ collateral, vaultName }: CollateralListProps) => {
	const accountBalances = useAccountBalances(vaultName)
	const accountVaults = useAccountVaults(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)

	return (
		<>
			<Typography variant='lg' className='text-center font-bold'>
				Collateral
			</Typography>
			<ListHeader headers={['Asset', 'Wallet', 'Underlying APY', 'Liquidity']} className='mr-10' />
			{collateral.map((vault: ActiveSupportedVault) => (
				<CollateralItem
					vault={vault}
					vaultName={vaultName}
					accountBalances={accountBalances}
					accountVaults={accountVaults}
					supplyBalances={supplyBalances}
					borrowBalances={borrowBalances}
					exchangeRates={exchangeRates}
					key={vault.vaultAddress}
				/>
			))}
		</>
	)
}

const CollateralItem: React.FC<CollateralItemProps> = ({
	vault,
	vaultName,
	accountBalances,
	supplyBalances,
	exchangeRates,
}: CollateralItemProps) => {
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const { account } = useWeb3React()

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances.find(balance => balance.address === vault.vaultAddress)
		if (supply === undefined) return BigNumber.from(0)
		if (exchangeRates[vault.vaultAddress] === undefined) return BigNumber.from(0)
		return decimate(supply.balance.mul(exchangeRates[vault.vaultAddress]))
	}, [supplyBalances, exchangeRates, vault.vaultAddress])

	// FIXME: Causes crash
	// const isInVault = useMemo(() => {
	// 	return accountVaults && vault && accountVaults.find(_vault => _vault.vaultAddress === vault.vaultAddress)
	// }, [accountVaults, vault])

	// const [isChecked, setIsChecked] = useState(!!isInVault)

	const [isOpen, setIsOpen] = useState(false)

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
		showSupplyModal && setIsOpen(true)
	}

	const baskets = useBaskets()
	const basket =
		vault.isBasket === true && baskets && baskets.find(basket => basket.address.toLowerCase() === vault.underlyingAddress.toLowerCase())

	const composition = useComposition(vault.isBasket === true && basket && basket)
	const avgBasketAPY =
		vault.isBasket && composition
			? (composition
					.sort((a, b) => (a.percentage.lt(b.percentage) ? 1 : -1))
					.map(component => {
						return component.apy
					})
					.reduce(function (a, b) {
						return a + parseFloat(formatUnits(b))
					}, 0) /
					composition.length) *
			  100
			: 0

	return (
		<>
			<Accordion open={isOpen || showSupplyModal} className='my-2 rounded border text-transparent-200'>
				<AccordionHeader
					onClick={handleOpen}
					className={`bg-primary-100 hover:bg-primary-200 rounded border-0 p-2 ${isOpen && 'bg-primary-200 rounded-b-none'}`}
				>
					<div className='flex w-full flex-row items-center justify-center'>
						<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
							<Image
								src={`/images/tokens/${vault.icon}`}
								alt={`${vault.underlyingSymbol}`}
								width={24}
								height={24}
								className='inline-block select-none'
							/>
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-medium leading-5'>{vault.underlyingSymbol}</Typography>
							</span>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>
								{account
									? getDisplayBalance(
											accountBalances.find(balance => balance.address === vault.underlyingAddress).balance,
											vault.underlyingDecimals,
									  )
									: '-'}
							</Typography>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>
								{vault.isBasket && avgBasketAPY ? getDisplayBalance(avgBasketAPY, 0, 2) + '%' : '-'}
							</Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{`$${getDisplayBalance(decimate(vault.supplied.mul(vault.price).sub(vault.totalBorrows.mul(vault.price)), 18))}`}
								</span>
							</Typography>
						</div>
					</div>
				</AccordionHeader>
				<AccordionBody className='bg-primary-100 rounded-b-lg p-3'>
					<StatBlock
						label='Supply Details'
						stats={[
							{
								label: 'Total Supplied',
								value: `${getDisplayBalance(vault.supplied, vault.underlyingDecimals)} ${vault.underlyingSymbol} | $${getDisplayBalance(
									decimate(vault.supplied.mul(vault.price)),
								)}`,
							},
							{
								label: 'Your Supply',
								value: `${getDisplayBalance(suppliedUnderlying, vault.underlyingDecimals)} ${vault.underlyingSymbol} | $${getDisplayBalance(
									decimate(suppliedUnderlying.mul(vault.price)),
								)}`,
							},
							// {
							// 	label: 'Collateral',
							// 	value: (
							// 		<Tooltipped
							// 			content={
							// 				<>
							// 					<Typography variant='sm' className='font-semibold'>
							// 						{isInVault ? 'Exit' : 'Enter'} Vault w/ Supplied Collateral
							// 					</Typography>
							// 					<Badge className='m-2 bg-red font-semibold'>WARNING</Badge>
							// 					<Typography variant='sm'>
							// 						Any supplied assets that are flagged as collateral can be seized if you are liquidated.
							// 					</Typography>
							// 				</>
							// 			}
							// 		>
							// 			<Switch
							// 				checked={isChecked}
							// 				disabled={
							// 					(isInVault && borrowed.gt(0)) ||
							// 					supplyBalances.find(balance => balance.address === vault.vaultAddress).balance.eq(0)
							// 				}
							// 				onChange={setIsChecked}
							// 				onClick={(event: { stopPropagation: () => void }) => {
							// 					event.stopPropagation()
							// 					if (isInVault) {
							// 						handleTx(comptroller.exitMarket(vault.vaultAddress), `Exit Vault (${vault.underlyingSymbol})`)
							// 					} else {
							// 						handleTx(
							// 							comptroller.enterMarkets([vault.vaultAddress], Config.addressMap.DEAD), // Use dead as a placeholder param for `address borrower`, it will be unused
							// 							`Enter Vault (${vault.underlyingSymbol})`,
							// 						)
							// 					}
							// 				}}
							// 				className={classNames(
							// 					!isInVault && borrowed.eq(0) ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100',
							// 					'border-transparent relative inline-flex h-[14px] w-[28px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
							// 				)}
							// 			>
							// 				<span
							// 					aria-hidden='true'
							// 					className={classNames(
							// 						isInVault ? 'translate-x-[14px]' : 'translate-x-0',
							// 						'pointer-events-none inline-block h-[10px] w-[10px] transform rounded-full bg-text-300 shadow ring-0 transition duration-200 ease-in-out',
							// 					)}
							// 				/>
							// 			</Switch>
							// 		</Tooltipped>
							// 	),
							// },
							{
								label: 'Wallet Balance',
								value: `${getDisplayBalance(
									accountBalances.find(balance => balance.address === vault.underlyingAddress).balance,
									vault.underlyingDecimals,
								)} ${vault.underlyingSymbol}`,
							},
						]}
					/>
					<div className='mt-4' />
					<VaultDetails asset={vault} title='Vault Details' vaultName={vaultName} />
					<div className={`mt-4 flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
						<div className='flex w-full flex-col'>
							<Button fullWidth onClick={() => setShowSupplyModal(true)} className='!p-2 !text-base'>
								Supply / Withdraw
							</Button>
						</div>
					</div>
				</AccordionBody>
			</Accordion>
			<VaultSupplyModal
				vaultName={vaultName}
				asset={vault}
				show={showSupplyModal}
				onHide={() => {
					setShowSupplyModal(false)
					setIsOpen(true)
				}}
			/>
		</>
	)
}

type VaultStatProps = {
	title?: string
	asset: ActiveSupportedVault
	amount?: string
	vaultName: string
}

const VaultStats: React.FC<VaultStatProps> = ({ asset, amount, vaultName }: VaultStatProps) => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const borrowBalances = useBorrowBalances(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)

	const { data: maxMintable } = useQuery(
		['@/hooks/base/useTokenBalance', providerKey(library, account, chainId)],
		async () => {
			const _maxMintable = await asset.underlyingContract.balanceOf(asset.vaultAddress)
			return _maxMintable
		},
		{
			placeholderData: BigNumber.from(0),
		},
	)

	const borrowed = useMemo(
		() => asset && borrowBalances.find(balance => balance.address === asset.vaultAddress).balance,
		[borrowBalances, asset],
	)

	const change = amount ? decimate(parseUnits(amount).mul(asset.price)) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const newBorrowable = asset && decimate(borrowable).add(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

	const healthFactor = useHealthFactor(vaultName)

	return (
		<div className='mb-4 flex flex-col gap-4 rounded'>
			<StatBlock
				className='flex basis-1/2 flex-col'
				stats={[
					{
						label: `Current ${asset.underlyingSymbol} Price`,
						value: `$${getDisplayBalance(asset.price)}`,
					},
					{
						label: 'Total Debt',
						value: `${getDisplayBalance(asset.totalBorrows)} ${asset.underlyingSymbol}`,
					},
					{
						label: 'Total Debt USD',
						value: `$${getDisplayBalance(decimate(asset.totalBorrows.mul(asset.price)), asset.underlyingDecimals)}`,
					},
					{
						label: 'Total Collateral USD',
						value: `-`,
					},
					{
						label: 'Minimum Borrow',
						value: `${asset.minimumBorrow ? asset.minimumBorrow.toLocaleString() : '-'} ${
							asset.minimumBorrow ? asset.underlyingSymbol : ''
						}`,
					},
					{
						label: 'Max Mintable',
						value: `${getDisplayBalance(maxMintable ? maxMintable : 0)} ${asset.underlyingSymbol}`,
					},
				]}
			/>
			<StatBlock
				className='flex basis-1/2 flex-col'
				label='User Info'
				stats={[
					{
						label: 'Your Collateral USD',
						value: `$${
							bao && account && accountLiquidity
								? getDisplayBalance(decimate(BigNumber.from(accountLiquidity.usdSupply.toString())), 18, 2)
								: 0
						}`,
					},
					{
						label: 'Your Debt',
						value: `${accountLiquidity ? getDisplayBalance(borrowed) : 0} ${asset.underlyingSymbol}`,
					},
					{
						label: 'Your Debt USD',
						value: `$${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}`,
					},
					{
						label: 'Debt Limit Remaining',
						value: `$${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable : BigNumber.from(0))} ➜ $${getDisplayBalance(
							accountLiquidity ? accountLiquidity.usdBorrowable.sub(change) : BigNumber.from(0),
						)}`,
					},
					{
						// FIXME: Fix this for when a users current borrow amount is zero
						label: 'Debt Limit Used',
						value: `${getDisplayBalance(
							accountLiquidity && !borrowable.eq(0) ? accountLiquidity.usdBorrow.div(decimate(borrowable)).mul(100) : 0,
							18,
							2,
						)}% ➜ ${getDisplayBalance(
							accountLiquidity && !newBorrowable.eq(0) ? accountLiquidity.usdBorrow.div(newBorrowable).mul(100) : 0,
							18,
							2,
						)}%`,
					},
					{
						label: `Debt Health`,
						value: `${
							healthFactor &&
							(healthFactor.lte(BigNumber.from(0)) ? '-' : healthFactor.gt(parseUnits('10000')) ? '∞' : getDisplayBalance(healthFactor))
						}`,
					},
				]}
			/>
		</div>
	)
}

export default Vault

type CollateralItemProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountBalances?: Balance[]
	accountVaults?: ActiveSupportedVault[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
