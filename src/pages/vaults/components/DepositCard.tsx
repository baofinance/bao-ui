import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import Card from '@/components/Card/Card'
import Input from '@/components/Input'
import { StatBlock } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import { Balance } from '@/hooks/vaults/useBalances'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import SupplyModal from './Modals/SupplyModal'

export const DepositCard = ({
	vaultName,
	collateral,
	balances,
	accountBalances,
	onUpdate,
}: {
	vaultName: string
	balances: Balance[]
	collateral: ActiveSupportedVault[]
	accountBalances: Balance[]
	onUpdate: (updatedState: any) => void
}) => {
	const { account } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const [selectedOption, setSelectedOption] = useState('ETH')
	const [showSupplyModal, setShowSupplyModal] = useState(false)

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

	const max = () => {
		return balances
			? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
			: BigNumber.from(0)
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	useEffect(() => {
		if (val != '') {
			onUpdate(decimate(parseUnits(val).mul(asset.price)).toString())
		}
	}, [asset, onUpdate, val])

	const hide = () => {
		setVal('')
		setShowSupplyModal(false)
	}

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Deposit
			</Typography>
			<Card className='glassmorphic-card p-6'>
				<Card.Body>
					<div className='flex w-full gap-2 rounded-full border border-baoWhite border-opacity-20 bg-baoWhite bg-opacity-5'>
						<Listbox value={selectedOption} onChange={setSelectedOption}>
							{({ open }) => (
								<div>
									<Listbox.Button className={(classNames(open ? 'text-baoRed' : 'text-baoWhite'), 'inline-flex')}>
										<div className='m-2 mr-0 flex w-10 rounded-full border-none duration-300 lg:!m-2 lg:w-32 lg:bg-baoWhite/5 lg:hover:bg-transparent-300'>
											<div className='m-auto text-baoWhite lg:py-3'>
												{selectedOption === '' ? (
													<Typography>Select a collateral</Typography>
												) : (
													<div className='items-start'>
														<div className='inline-block lg:mr-2'>
															<Image
																className='z-10 inline-block select-none'
																src={asset && `/images/tokens/${asset.underlyingSymbol}.png`}
																alt={asset && asset.underlyingSymbol}
																width={isDesktop ? 24 : 32}
																height={isDesktop ? 24 : 32}
															/>
														</div>
														<span className='hidden text-left align-middle lg:inline-block'>
															<Typography variant='xl' className='font-bakbak'>
																{asset && asset.underlyingSymbol}
															</Typography>
														</span>
													</div>
												)}
											</div>
											<div className='m-auto hidden justify-end text-end lg:ml-0 lg:block'>
												<ChevronDownIcon className='h-5 w-5 text-baoRed' aria-hidden='true' />
											</div>
										</div>
										<div className='m-auto block justify-end text-end lg:ml-0 lg:hidden'>
											<ChevronDownIcon className='-mr-1 h-5 w-5 text-baoWhite' aria-hidden='true' />
										</div>
									</Listbox.Button>

									<Transition show={open} as={Fragment} leave='transition ease-in duration-100' leaveFrom='opacity-100' leaveTo='opacity-0'>
										<Listbox.Options className='absolute z-10 w-auto origin-top-right overflow-hidden rounded-3xl border border-baoWhite/20 bg-baoBlack p-2 shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none'>
											<div className='grid grid-cols-6 p-2 font-bakbak font-normal text-baoWhite'>
												<div className='col-span-2'>
													<Typography variant='lg'>Asset</Typography>
												</div>
												<div className='col-span-2'>
													<Typography variant='lg' className='text-center'>
														APY
													</Typography>
												</div>
												<div className='col-span-2'>
													<Typography variant='lg' className='text-right'>
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
																'cursor-pointer select-none rounded-3xl border border-baoBlack p-4 text-sm',
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
							)}
						</Listbox>
						<div className='m-auto w-full'>
							<Input
								value={val}
								onChange={handleChange}
								onSelectMax={() => setVal(formatUnits(max(), asset.underlyingDecimals))}
								placeholder={`${formatUnits(max(), asset.underlyingDecimals)}`}
								className='h-10 !rounded-r-none lg:h-auto'
							/>
						</div>
						<div className='m-auto mr-2'>
							<Button
								onClick={() => setShowSupplyModal(true)}
								disabled={!account || !val || (val && parseUnits(val, asset.underlyingDecimals).gt(max()))}
								className={!isDesktop ? '!h-10 !px-2 !text-sm' : ''}
							>
								Supply
							</Button>
							<SupplyModal
								asset={asset}
								vaultName={vaultName}
								val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
								show={showSupplyModal}
								onHide={hide}
							/>
						</div>
					</div>
					<Typography variant='xl' className='p-4 text-center font-bakbak text-baoWhite/60'>
						Collateral Info
					</Typography>
					<StatBlock
						label=''
						stats={[
							{
								label: 'Total Supplied',
								value: (
									<>
										<Tooltipped
											content={`$${getDisplayBalance(decimate(asset.supplied.mul(asset.price)))}`}
											key={asset.underlyingSymbol}
											placement='top'
											className='rounded-full bg-baoRed'
										>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												{getDisplayBalance(asset.supplied, asset.underlyingDecimals)}
											</Typography>
										</Tooltipped>
										<Image
											className='z-10 ml-1 inline-block select-none'
											src={asset && `/images/tokens/${asset.underlyingSymbol}.png`}
											alt={asset && asset.underlyingSymbol}
											width={16}
											height={16}
										/>
									</>
								),
							},
							{
								label: 'Collateral Factor',
								value: (
									<>
										<Typography className='inline-block align-middle text-sm lg:text-base'>
											{getDisplayBalance(asset.collateralFactor.mul(100), 18, 0)}%
										</Typography>
									</>
								),
							},
							{
								label: 'Initial Margin Factor',
								value: (
									<>
										<Typography className='inline-block align-middle text-sm lg:text-base'>
											{getDisplayBalance(asset.imfFactor.mul(100), 18, 0)}%
										</Typography>
									</>
								),
							},
							{
								label: 'Reserve Factor',
								value: (
									<>
										<Typography className='inline-block align-middle text-sm lg:text-base'>
											{getDisplayBalance(asset.reserveFactor.mul(100), 18, 0)}%
										</Typography>
									</>
								),
							},
							{
								label: 'Total Reserves',
								value: (
									<>
										<Typography className='inline-block align-middle text-sm lg:text-base'>
											${getDisplayBalance(asset.totalReserves.mul(asset.price), 18 + asset.underlyingDecimals)}
										</Typography>
									</>
								),
							},
						]}
					/>
				</Card.Body>
			</Card>
		</>
	)
}

export default DepositCard
