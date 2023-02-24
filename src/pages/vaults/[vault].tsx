import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button, { NavButtons } from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { ListHeader } from '@/components/List'
import { PageLoader } from '@/components/Loader'
import { StatBlock } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useBasketInfo from '@/hooks/baskets/useBasketInfo'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import { AccountLiquidity, useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { Balance, useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import useHealthFactor from '@/hooks/vaults/useHealthFactor'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import { useAccountVaults, useVaults } from '@/hooks/vaults/useVaults'
import type { Comptroller } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { decimate, exponentiate, getDisplayBalance, sqrt } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Switch } from '@headlessui/react'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react/components/Accordion'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber, FixedNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import VaultBorrowModal from './components/Modals/BorrowModal'
import VaultSupplyModal from './components/Modals/SupplyModal'
import { VaultDetails } from './components/Stats'
import VaultButton from './components/VaultButton'
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
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
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
	const operations = ['Mint', 'Repay']
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

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
		showBorrowModal && setIsOpen(true)
	}

	const accountBal = synth && accountBalances && accountBalances.find(balance => balance.address === synth.underlyingAddress)
	const accountBalance = accountBal !== undefined ? accountBal.balance : BigNumber.from(0)

	const healthFactor = useHealthFactor(vaultName)

	const borrowLimit =
		accountLiquidity && !accountLiquidity.usdBorrow.eq(0)
			? accountLiquidity.usdBorrow.div(accountLiquidity.usdBorrowable.add(accountLiquidity.usdBorrow)).mul(100)
			: BigNumber.from(0)

	const healthFactorColor = (healthFactor: BigNumber) => {
		const c = healthFactor.eq(0)
			? `${(props: any) => props.theme.color.text[100]}`
			: healthFactor.lte(parseUnits('1.25'))
			? '#e32222'
			: healthFactor.lt(parseUnits('1.55'))
			? '#ffdf19'
			: '#45be31'
		return c
	}

	const { data: maxMintable } = useQuery(
		['@/hooks/base/useTokenBalance', providerKey(library, account, chainId)],
		async () => {
			const _maxMintable = await synth.underlyingContract.balanceOf(synth.vaultAddress)
			return _maxMintable
		},
		{
			placeholderData: BigNumber.from(0),
		},
	)

	const supply = useMemo(
		() =>
			supplyBalances &&
			synth &&
			supplyBalances.find(balance => balance.address.toLowerCase() === synth.vaultAddress.toLowerCase()) &&
			exchangeRates &&
			synth &&
			exchangeRates[synth.vaultAddress]
				? decimate(
						supplyBalances
							.find(balance => balance.address.toLowerCase() === synth.vaultAddress.toLowerCase())
							.balance.mul(exchangeRates[synth.vaultAddress]),
				  )
				: BigNumber.from(0),
		[supplyBalances, exchangeRates, synth],
	)

	let _imfFactor = synth && synth.imfFactor
	if (accountLiquidity) {
		const _sqrt = sqrt(supply)
		const num = exponentiate(parseUnits('1.1'))
		const denom = synth && decimate(synth.imfFactor.mul(_sqrt).add(parseUnits('1')))
		_imfFactor = synth && num.div(denom)
	}

	let withdrawable = BigNumber.from(0)
	if (synth && _imfFactor.gt(synth.collateralFactor) && synth.price.gt(0)) {
		if (synth.collateralFactor.mul(synth.price).gt(0)) {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(synth.collateralFactor.mul(synth.price)))
		} else {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(_imfFactor).mul(synth.price))
		}
	}

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

	const change = val ? decimate(BigNumber.from(val).mul(synth.price)) : BigNumber.from(0)
	const borrow = accountLiquidity ? accountLiquidity.usdBorrow : BigNumber.from(0)
	const newBorrow = borrow ? borrow.sub(change.gt(0) ? change : 0) : BigNumber.from(0)
	const borrowable = accountLiquidity ? decimate(accountLiquidity.usdBorrow).add(accountLiquidity.usdBorrowable) : BigNumber.from(0)
	const newBorrowable = synth && decimate(borrowable).add(BigNumber.from(parseUnits(formatUnits(change, 36 - synth.underlyingDecimals))))

	const synthBalance = useMemo(
		() =>
			synth && balances && balances.find(_balance => _balance.address === synth.underlyingAddress)
				? balances.find(_balance => _balance.address === synth.underlyingAddress).balance
				: 0,
		[balances, synth],
	)

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
						<div className='mb-4 flex h-fit w-fit flex-row gap-4 rounded border-0 bg-primary-100 p-3'>
							<FontAwesomeIcon icon={faArrowLeft} />
						</div>
						<div className='mb-4 flex w-full flex-row gap-4 rounded border-0 bg-primary-100 p-3'>
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
								<Typography className='ml-2 inline-block !text-lg leading-5'>{getDisplayBalance(synth.borrowApy)}%</Typography>
								<Typography className='ml-1 inline-block !text-lg text-text-100'>APY</Typography>
							</div>
						</div>

						{account && (
							<>
								<div className='flex w-full flex-row'>
									<Typography variant='lg' className='m-auto mb-2 justify-center font-bold'>
										Dashboard
									</Typography>
								</div>
								<div className='mb-4 flex flex-row gap-4'>
									<div className='flex w-1/2 flex-col'>
										<StatBlock
											className='mb-4'
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
													value: `${accountLiquidity ? getDisplayBalance(borrowed) : 0} ${synth.underlyingSymbol}`,
												},
												{
													label: 'Your Debt USD',
													value: `$${accountLiquidity ? getDisplayBalance(decimate(accountLiquidity.usdBorrow), 18, 2) : 0}`,
												},
												{
													label: 'Debt Limit Remaining',
													value: `$${getDisplayBalance(
														accountLiquidity ? accountLiquidity.usdBorrowable : BigNumber.from(0),
													)} ➜ $${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable.add(change) : BigNumber.from(0))}`,
												},
												{
													// FIXME: Fix this for when a users current borrow amount is zero
													label: 'Debt Limit Used',
													value: `${getDisplayBalance(
														!borrowable.eq(0) ? exponentiate(borrow).div(borrowable).mul(100) : 0,
														18,
														2,
													)}% ➜ ${getDisplayBalance(!newBorrowable.eq(0) ? newBorrow.div(newBorrowable).mul(100) : 0, 18, 2)}%`,
												},
												{
													label: `Debt Health`,
													value: `${
														healthFactor &&
														healthFactor &&
														(healthFactor.lte(0) ? (
															'-'
														) : parseFloat(formatUnits(healthFactor)) > 10000 ? (
															<p>
																{'>'} 10000 <Tooltipped content={`Your health factor is ${formatUnits(healthFactor)}.`} />
															</p>
														) : (
															getDisplayBalance(healthFactor)
														))
													}`,
												},
											]}
										/>
									</div>
									<div className='flex w-1/2 flex-col'>
										<Card.Options className='mt-0'>
											<NavButtons options={operations} active={operation} onClick={setOperation} />
										</Card.Options>
										<Card.Body>
											<div className='mb-4 flex flex-col items-center justify-center'>
												<div className='flex w-full flex-row'>
													<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
														<Typography variant='sm' className='text-text-200'>
															Wallet:
														</Typography>
														<Typography variant='sm'>{`${getDisplayBalance(synthBalance)}`}</Typography>
													</div>
													<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
														<Typography variant='sm' className='text-text-200'>
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
										</Card.Body>
										<Card.Actions>
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
														vaultName === 'baoUSD' &&
														parseUnits(val, synth.underlyingDecimals).lt(parseUnits('5000')) &&
														operation === 'Mint')
												}
											/>
										</Card.Actions>
									</div>
								</div>
							</>
						)}

						<StatBlock
							className='mb-4'
							label='Vault Info'
							stats={[
								{
									label: `Current ${synth.underlyingSymbol} Price`,
									value: `$${getDisplayBalance(synth.price)}`,
								},
								{
									label: 'Total Debt',
									value: `${getDisplayBalance(synth.totalBorrows)} ${synth.underlyingSymbol}`,
								},
								{
									label: 'Total Debt USD',
									value: `$${getDisplayBalance(decimate(synth.totalBorrows.mul(synth.price)), synth.underlyingDecimals)}`,
								},
								{
									label: 'Total Collateral USD',
									value: `-`,
								},
								{
									label: 'Minimum Borrow',
									value: `5000 baoUSD`,
								},
								{
									label: 'Max Mintable',
									value: `${getDisplayBalance(maxMintable ? maxMintable : 0)} ${synth.underlyingSymbol}`,
								},
							]}
						/>

						<div className='flex w-full flex-col'>
							<Typography variant='lg' className='text-center font-bold'>
								Supply
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

const CollateralItem: React.FC<CollateralItemProps> = ({
	vault,
	vaultName,
	accountBalances,
	accountVaults,
	supplyBalances,
	borrowBalances,
	exchangeRates,
}: CollateralItemProps) => {
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const { account } = useWeb3React()
	const { handleTx } = useTransactionHandler()
	const comptroller = useContract<Comptroller>('Comptroller', vaultName && Config.vaults[vaultName].comptroller)

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances.find(balance => balance.address === vault.vaultAddress)
		if (supply === undefined) return BigNumber.from(0)
		if (exchangeRates[vault.vaultAddress] === undefined) return BigNumber.from(0)
		return decimate(supply.balance.mul(exchangeRates[vault.vaultAddress]))
	}, [supplyBalances, exchangeRates, vault.vaultAddress])

	const borrowed = useMemo(() => {
		const borrow = borrowBalances.find(balance => balance.address === vault.vaultAddress)
		if (borrow === undefined) return BigNumber.from(0)
		return borrow.balance
	}, [vault, borrowBalances])

	const isInVault = useMemo(() => {
		console.log(accountVaults)
		return accountVaults && accountVaults.find(_vault => _vault.vaultAddress === vault.vaultAddress)
	}, [accountVaults, vault.vaultAddress])

	const [isChecked, setIsChecked] = useState(!!isInVault)
	const [isOpen, setIsOpen] = useState(false)

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
		showSupplyModal && setIsOpen(true)
	}

	const baskets = useBaskets()
	const basket = useMemo(() => {
		if (!baskets) return
		return baskets.find(basket => basket.symbol === 'bSTBL')
	}, [baskets])
	const info = useBasketInfo(basket)
	const composition = useComposition(basket)
	const avgBasketAPY =
		composition &&
		(composition
			.map(function (component) {
				return component.apy
			})
			.reduce(function (a, b) {
				return a + parseFloat(formatUnits(b))
			}, 0) /
			composition.length) *
			100

	return (
		<>
			<Accordion open={isOpen || showSupplyModal} className='my-2 rounded border border-primary-300'>
				<AccordionHeader
					onClick={handleOpen}
					className={`rounded border-0 bg-primary-100 p-2 hover:bg-primary-200 ${isOpen && 'rounded-b-none bg-primary-200'}`}
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
				<AccordionBody className='rounded-b-lg bg-primary-100 p-3'>
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
							{
								label: 'Collateral',
								value: (
									<Tooltipped
										content={
											<>
												<Typography variant='sm' className='font-semibold'>
													{isInVault ? 'Exit' : 'Enter'} Vault w/ Supplied Collateral
												</Typography>
												<Badge className='m-2 bg-red font-semibold'>WARNING</Badge>
												<Typography variant='sm'>
													Any supplied assets that are flagged as collateral can be seized if you are liquidated.
												</Typography>
											</>
										}
									>
										<Switch
											checked={isChecked}
											disabled={
												(isInVault && borrowed.gt(0)) ||
												supplyBalances.find(balance => balance.address === vault.vaultAddress).balance.eq(0)
											}
											onChange={setIsChecked}
											onClick={(event: { stopPropagation: () => void }) => {
												event.stopPropagation()
												if (isInVault) {
													handleTx(comptroller.exitMarket(vault.vaultAddress), `Exit Vault (${vault.underlyingSymbol})`)
												} else {
													handleTx(
														comptroller.enterMarkets([vault.vaultAddress], Config.addressMap.DEAD), // Use dead as a placeholder param for `address borrower`, it will be unused
														`Enter Vault (${vault.underlyingSymbol})`,
													)
												}
											}}
											className={classNames(
												!isInVault && borrowed.eq(0) ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100',
												'border-transparent relative inline-flex h-[14px] w-[28px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
											)}
										>
											<span
												aria-hidden='true'
												className={classNames(
													isInVault ? 'translate-x-[14px]' : 'translate-x-0',
													'pointer-events-none inline-block h-[10px] w-[10px] transform rounded-full bg-text-300 shadow ring-0 transition duration-200 ease-in-out',
												)}
											/>
										</Switch>
									</Tooltipped>
								),
							},
							{
								label: 'Wallet Balance',
								value: `${getDisplayBalance(
									accountBalances.find(balance => balance.address === vault.underlyingAddress).balance,
									vault.underlyingDecimals,
								)} ${vault.underlyingSymbol}`,
							},
						]}
					/>
					<VaultDetails asset={vault} title='Vault Details' vaultName={vaultName} />
					<div className={`mt-4 flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
						<div className='flex w-full flex-col'>
							<Button fullWidth onClick={() => setShowSupplyModal(true)} className='!p-2 !text-base'>
								Supply / Withdraw
							</Button>
						</div>
						<div className='flex w-full flex-col'>
							<Link href={`/vaults/${vault.underlyingSymbol}`}>
								<Button fullWidth text='Details' />
							</Link>
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
