import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { ListHeader } from '@/components/List'
import { PageLoader } from '@/components/Loader'
import { StatBlock } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { AccountLiquidity, useAccountLiquidity } from '@/hooks/markets/useAccountLiquidity'
import { Balance, useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { useAccountMarkets } from '@/hooks/markets/useMarkets'
import type { Comptroller } from '@/typechain/index'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Switch } from '@headlessui/react'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react/components/Accordion'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import MarketBorrowModal from './Modals/BorrowModal'
import MarketSupplyModal from './Modals/SupplyModal'
import { MarketDetails } from './Stats'

// FIXME: these components should all be using ethers.BigNumber instead of js float math

export const MarketList: React.FC<MarketListProps> = ({ markets: _markets }: MarketListProps) => {
	const accountBalances = useAccountBalances()
	const accountMarkets = useAccountMarkets()
	const accountLiquidity = useAccountLiquidity()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()

	const collateralMarkets = useMemo(() => {
		if (!(_markets && supplyBalances)) return
		return _markets
			.filter(market => !market.isSynth)
			.sort((a, b) => {
				void a
				return supplyBalances.find(balance => balance.address.toLowerCase() === b.marketAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [_markets, supplyBalances])

	const synthMarkets = useMemo(() => {
		if (!(_markets && borrowBalances)) return
		return _markets
			.filter(market => market.isSynth)
			.sort((a, b) => {
				void a
				return borrowBalances.find(balance => balance.address.toLowerCase() === b.marketAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [_markets, borrowBalances])

	return (
		<>
			{collateralMarkets &&
			synthMarkets &&
			accountBalances &&
			accountLiquidity &&
			accountMarkets &&
			supplyBalances &&
			borrowBalances &&
			exchangeRates ? (
				<div className={`flex ${isDesktop ? 'flex-row gap-12' : 'mt-4 flex-col gap-4'}`}>
					<div className='flex w-full flex-col'>
						<Typography variant='xl' className='text-center'>
							Collateral
						</Typography>
						<ListHeader headers={['Asset', 'Wallet', 'Liquidity']} className='mr-10' />
						{collateralMarkets.map((market: ActiveSupportedMarket) => (
							<MarketListItemCollateral
								market={market}
								accountBalances={accountBalances}
								accountMarkets={accountMarkets}
								supplyBalances={supplyBalances}
								borrowBalances={borrowBalances}
								exchangeRates={exchangeRates}
								key={market.marketAddress}
							/>
						))}
					</div>
					<div className='flex w-full flex-col'>
						<Typography variant='xl' className='text-center'>
							Synthetics
						</Typography>
						<ListHeader headers={['Asset', 'APR', 'Wallet']} className='mr-10' />
						{synthMarkets.map((market: ActiveSupportedMarket) => (
							<MarketListItemSynth
								market={market}
								accountLiquidity={accountLiquidity}
								accountBalances={accountBalances}
								borrowBalances={borrowBalances}
								exchangeRates={exchangeRates}
								key={market.marketAddress}
							/>
						))}
					</div>
				</div>
			) : (
				<PageLoader block />
			)}
		</>
	)
}

const MarketListItemCollateral: React.FC<MarketListItemProps> = ({
	market,
	accountBalances,
	accountMarkets,
	supplyBalances,
	borrowBalances,
	exchangeRates,
}: MarketListItemProps) => {
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	const { account } = useWeb3React()
	const { handleTx } = useTransactionHandler()
	const comptroller = useContract<Comptroller>('Comptroller')

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances.find(balance => balance.address === market.marketAddress)
		if (supply === undefined) return BigNumber.from(0)
		return decimate(supply.balance.mul(exchangeRates[market.marketAddress]))
	}, [supplyBalances, exchangeRates, market.marketAddress])

	const borrowed = useMemo(() => {
		const borrow = borrowBalances.find(balance => balance.address === market.marketAddress)
		if (borrow === undefined) return BigNumber.from(0)
		return borrow.balance
	}, [market, borrowBalances])

	const isInMarket = useMemo(
		() => accountMarkets && accountMarkets.find(_market => _market.marketAddress === market.marketAddress),
		[accountMarkets, market.marketAddress],
	)

	const [isChecked, setIsChecked] = useState(!!isInMarket)
	const [isOpen, setIsOpen] = useState(false)

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
		showSupplyModal && setIsOpen(true)
	}

	return (
		<>
			<Accordion open={isOpen || showSupplyModal} className='my-2 rounded border border-primary-300'>
				<AccordionHeader
					onClick={handleOpen}
					className={`rounded border-0 bg-primary-100 p-3 hover:bg-primary-200 ${isOpen && 'rounded-b-none bg-primary-200'}`}
				>
					<div className='flex w-full flex-row items-center justify-center'>
						<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
							<Image
								src={`/images/tokens/${market.icon}`}
								alt={`${market.underlyingSymbol}`}
								width={32}
								height={32}
								className='inline-block select-none'
							/>
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-medium leading-5'>{market.underlyingSymbol}</Typography>
							</span>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>
								{account
									? getDisplayBalance(
											accountBalances.find(balance => balance.address === market.underlyingAddress).balance,
											market.underlyingDecimals,
									  )
									: '-'}
							</Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{`$${getDisplayBalance(decimate(market.supplied.mul(market.price).sub(market.totalBorrows.mul(market.price)), 18))}`}
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
								value: `${getDisplayBalance(market.supplied, market.underlyingDecimals)} ${market.underlyingSymbol} | $${getDisplayBalance(
									decimate(market.supplied.mul(market.price)),
								)}`,
							},
							{
								label: 'Your Supply',
								value: `${getDisplayBalance(suppliedUnderlying)} ${market.underlyingSymbol} | $${getDisplayBalance(
									decimate(suppliedUnderlying.mul(market.price)),
								)}`,
							},
							{
								label: 'Collateral',
								value: (
									<Tooltipped
										content={
											<>
												<Typography variant='sm' className='font-semibold'>
													{isInMarket ? 'Exit' : 'Enter'} Market w/ Supplied Collateral
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
												(isInMarket && borrowed.gt(0)) ||
												supplyBalances.find(balance => balance.address === market.marketAddress).balance.eq(0)
											}
											onChange={setIsChecked}
											onClick={(event: { stopPropagation: () => void }) => {
												event.stopPropagation()
												if (isInMarket) {
													handleTx(comptroller.exitMarket(market.marketAddress), `Exit Market (${market.underlyingSymbol})`)
												} else {
													handleTx(
														comptroller.enterMarkets([market.marketAddress], Config.addressMap.DEAD), // Use dead as a placeholder param for `address borrower`, it will be unused
														`Enter Market (${market.underlyingSymbol})`,
													)
												}
											}}
											className={classNames(
												!isInMarket && borrowed.eq(0) ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100',
												'border-transparent relative inline-flex h-[14px] w-[28px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
											)}
										>
											<span
												aria-hidden='true'
												className={classNames(
													isInMarket ? 'translate-x-[14px]' : 'translate-x-0',
													'pointer-events-none inline-block h-[10px] w-[10px] transform rounded-full bg-text-300 shadow ring-0 transition duration-200 ease-in-out',
												)}
											/>
										</Switch>
									</Tooltipped>
								),
							},
							{
								label: 'Wallet Balance',
								value: `${getDisplayBalance(accountBalances.find(balance => balance.address === market.underlyingAddress).balance)} ${
									market.underlyingSymbol
								}`,
							},
						]}
					/>
					<MarketDetails asset={market} title='Market Details' />
					<div className={`mt-4 flex ${isDesktop ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
						<div className='flex w-full flex-col'>
							<Button fullWidth onClick={() => setShowSupplyModal(true)}>
								Supply / Withdraw
							</Button>
						</div>
						<div className='flex w-full flex-col'>
							<Link href={`/markets/${market.underlyingSymbol}`}>
								<Button fullWidth text='Details' />
							</Link>
						</div>
					</div>
				</AccordionBody>
			</Accordion>
			<MarketSupplyModal
				asset={market}
				show={showSupplyModal}
				onHide={() => {
					setShowSupplyModal(false)
					setIsOpen(true)
				}}
			/>
		</>
	)
}

const MarketListItemSynth: React.FC<MarketListItemProps> = ({
	market,
	accountLiquidity,
	accountBalances,
	borrowBalances,
}: MarketListItemProps) => {
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const borrowed = useMemo(() => borrowBalances.find(balance => balance.address === market.marketAddress).balance, [borrowBalances, market])

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
		showBorrowModal && setIsOpen(true)
	}

	const accountBal = accountBalances.find(balance => balance.address === market.underlyingAddress)
	const accountBalance = accountBal !== undefined ? accountBal.balance : BigNumber.from(0)

	return (
		<>
			<Accordion open={isOpen || showBorrowModal} className='my-2 rounded border border-primary-300'>
				<AccordionHeader
					onClick={handleOpen}
					className={`rounded border-0 bg-primary-100 p-3 hover:bg-primary-200 ${isOpen && 'rounded-b-none bg-primary-200'}`}
				>
					<div className='flex w-full flex-row items-center justify-center'>
						<div className='mx-auto my-0 flex w-full flex-row items-center text-start align-middle'>
							<Image
								src={`/images/tokens/${market.icon}`}
								alt={`${market.underlyingSymbol}`}
								width={32}
								height={32}
								className='inline-block select-none'
							/>
							<span className='inline-block text-left align-middle'>
								<Typography className='ml-2 font-medium leading-5'>{market.underlyingSymbol}</Typography>
							</span>
						</div>
						<div className='mx-auto my-0 flex w-full items-center justify-center'>
							<Typography className='ml-2 font-medium leading-5'>{getDisplayBalance(market.borrowApy)}% </Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>{getDisplayBalance(accountBalance)} </span>
							</Typography>
						</div>
					</div>
				</AccordionHeader>
				<AccordionBody className='bg-primary-100 p-3'>
					<StatBlock
						label='Debt Information'
						stats={[
							{
								label: 'Total Debt',
								value: `$${getDisplayBalance(decimate(market.totalBorrows.mul(market.price)), market.underlyingDecimals)}`,
							},
							{
								label: 'Your Debt',
								value: `${getDisplayBalance(borrowed)} ${market.underlyingSymbol} | $${getDisplayBalance(
									decimate(borrowed.mul(market.price)),
								)}`,
							},
							{
								label: 'Debt Limit Remaining',
								value: `$${getDisplayBalance(accountLiquidity.usdBorrowable)}`,
							},
							{
								label: '% of Your Debt',
								value: `${getDisplayBalance(
									accountLiquidity.usdBorrow.gt(0)
										? borrowed.mul(market.price).div(accountLiquidity.usdBorrow).mul(100)
										: BigNumber.from(0),
								)}%`,
							},
						]}
					/>
					<MarketDetails asset={market} title='Market Details' />
					<div className={`mt-4 flex ${isDesktop ? 'flex-row' : 'flex-col'} gap-4`}>
						<div className='flex w-full flex-col'>
							<Button fullWidth onClick={() => setShowBorrowModal(true)}>
								Mint / Repay
							</Button>
						</div>
						<div className='flex w-full flex-col'>
							<Link href={`/markets/${market.underlyingSymbol}`}>
								<Button fullWidth text='Details' />
							</Link>
						</div>
					</div>
				</AccordionBody>
			</Accordion>
			<MarketBorrowModal
				asset={market}
				show={showBorrowModal}
				onHide={() => {
					setShowBorrowModal(false)
					setIsOpen(true)
				}}
			/>
		</>
	)
}

export default MarketList

type MarketListProps = {
	markets: ActiveSupportedMarket[]
}

type MarketListItemProps = {
	market: ActiveSupportedMarket
	accountBalances?: Balance[]
	accountMarkets?: ActiveSupportedMarket[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
