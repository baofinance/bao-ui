import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import { getComptrollerContract } from '@/bao/utils'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { ListHeader } from '@/components/List'
import Loader from '@/components/Loader'
import { StatBlock } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { classNames } from '@/functions/styling'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { AccountLiquidity, useAccountLiquidity } from '@/hooks/markets/useAccountLiquidity'
import { Balance, useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { useAccountMarkets } from '@/hooks/markets/useMarkets'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { Switch } from '@headlessui/react'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import MarketBorrowModal from './Modals/BorrowModal'
import MarketSupplyModal from './Modals/SupplyModal'
import { MarketDetails } from './Stats'

export const MarketList: React.FC<MarketListProps> = ({ markets: _markets }: MarketListProps) => {
	const bao = useBao()
	const accountBalances = useAccountBalances()
	const accountMarkets = useAccountMarkets()
	const accountLiquidity = useAccountLiquidity()
	const supplyBalances = useSupplyBalances()
	const borrowBalances = useBorrowBalances()
	const { exchangeRates } = useExchangeRates()

	const collateralMarkets = useMemo(() => {
		if (!(bao && _markets && supplyBalances)) return
		return _markets
			.filter(market => !market.isSynth)
			.sort((a, b) => (supplyBalances.find(balance => balance.address.toLowerCase() === b.marketAddress.toLowerCase()).balance > 0 ? 1 : 0))
	}, [_markets, supplyBalances])

	const synthMarkets = useMemo(() => {
		if (!(bao && _markets && borrowBalances)) return
		return _markets
			.filter(market => market.isSynth)
			.sort((a, b) => (borrowBalances.find(balance => balance.address.toLowerCase() === b.marketAddress.toLowerCase()).balance > 0 ? 1 : 0))
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
				<div className='flex flex-row gap-12'>
					<div className='flex w-full flex-col'>
						<Typography variant='h3'>Collateral</Typography>
						<ListHeader headers={['Asset', 'Wallet', 'Liquidity']} />
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
						<Typography variant='h3'>Synthetics</Typography>
						<ListHeader headers={['Asset', 'APR', 'Wallet']} />
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
				<Loader />
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
	const { handleTx } = useTransactionHandler()
	const bao = useBao()
	const { account } = useWeb3React()

	const [open, setOpen] = useState(0)

	const handleOpen = value => {
		setOpen(open === value ? 0 : value)
	}

	const suppliedUnderlying = useMemo(
		() =>
			supplyBalances.find(balance => balance.address === market.marketAddress).balance *
			decimate(exchangeRates[market.marketAddress]).toNumber(),
		[supplyBalances, exchangeRates],
	)

	const borrowed = useMemo(
		() => borrowBalances.find(balance => balance.address === market.marketAddress).balance,
		[borrowBalances, exchangeRates],
	)

	const isInMarket = useMemo(
		() => accountMarkets && accountMarkets.find(_market => _market.marketAddress === market.marketAddress),
		[accountMarkets],
	)

	const [isChecked, setIsChecked] = useState(!!isInMarket)

	return (
		<>
			<Accordion open={open === 1} onClick={() => handleOpen(1)} className='my-2 rounded-lg border border-primary-300'>
				<AccordionHeader className='rounded-lg bg-primary-100 p-3 text-text-100 hover:bg-primary-200'>
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
								{account ? accountBalances.find(balance => balance.address === market.underlyingAddress).balance.toFixed(4) : '-'}
							</Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{`$${getDisplayBalance(market.supplied * market.price - market.totalBorrows * market.price, 0, 0)}`}
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
								value: `${market.supplied.toFixed(4)} ${market.underlyingSymbol} | $${getDisplayBalance(
									market.supplied * market.price,
									0,
								)}`,
							},
							{
								label: 'Your Supply',
								value: `${suppliedUnderlying.toFixed(4)} ${market.underlyingSymbol} | $${getDisplayBalance(
									suppliedUnderlying * market.price,
									0,
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
												(isInMarket && borrowed > 0) ||
												supplyBalances.find(balance => balance.address === market.marketAddress).balance === 0
											}
											onChange={setIsChecked}
											onClick={event => {
												event.stopPropagation()
												const contract = getComptrollerContract(bao)
												if (isInMarket) {
													handleTx(
														contract.methods.exitMarket(market.marketAddress).send({ from: account }),
														`Exit Market (${market.underlyingSymbol})`,
													)
												} else {
													handleTx(
														contract.methods.enterMarkets([market.marketAddress], Config.addressMap.DEAD).send({ from: account }), // Use dead as a placeholder param for `address borrower`, it will be unused
														`Enter Market (${market.underlyingSymbol})`,
													)
												}
											}}
											className={classNames(
												!isInMarket && borrowed === 0 ? 'cursor-default opacity-50' : 'cursor-pointer opacity-100',
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
								value: `${accountBalances.find(balance => balance.address === market.underlyingAddress).balance.toFixed(4)} ${
									market.underlyingSymbol
								}`,
							},
						]}
					/>
					<MarketDetails asset={market} title='Market Details' />
					<div className='mt-4 flex flex-row gap-4'>
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
			<MarketSupplyModal asset={market} show={showSupplyModal} onHide={() => setShowSupplyModal(false)} />
		</>
	)
}

const MarketListItemSynth: React.FC<MarketListItemProps> = ({
	market,
	accountLiquidity,
	accountBalances,
	borrowBalances,
	exchangeRates,
}: MarketListItemProps) => {
	const [showBorrowModal, setShowBorrowModal] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	const borrowed = useMemo(
		() => borrowBalances.find(balance => balance.address === market.marketAddress).balance,
		[borrowBalances, exchangeRates],
	)

	const handleOpen = () => {
		!isOpen ? setIsOpen(true) : setIsOpen(false)
	}

	return (
		<>
			<Accordion open={isOpen} onClick={() => handleOpen()} className='my-2 rounded-lg border border-primary-300'>
				<AccordionHeader className={`bg-primary-100 p-3 text-text-100 hover:bg-primary-200 rounded-lg border-0 ${isOpen && 'bg-primary-200 rounded-b-none'}`}>
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
							<Typography className='ml-2 font-medium leading-5'>{market.borrowApy.toFixed(2)}% </Typography>
						</div>
						<div className='mx-auto my-0 flex w-full flex-col items-end'>
							<Typography className='ml-2 font-medium leading-5'>
								<span className='inline-block align-middle'>
									{accountBalances.find(balance => balance.address === market.underlyingAddress).balance.toFixed(4)}{' '}
								</span>
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
								value: `$${getDisplayBalance(market.totalBorrows * market.price, 0)}`,
							},
							{
								label: 'Your Debt',
								value: `${borrowed.toFixed(4)} ${market.underlyingSymbol} | $${getDisplayBalance(borrowed * market.price, 0)}`,
							},
							{
								label: 'Debt Limit Remaining',
								value: `$${getDisplayBalance(accountLiquidity.usdBorrowable, 0)}`,
							},
							{
								label: '% of Your Debt',
								value: `${Math.floor(
									accountLiquidity.usdBorrow > 0 ? ((borrowed * market.price) / accountLiquidity.usdBorrow) * 100 : 0,
								)}%`,
							},
						]}
					/>
					<MarketDetails asset={market} title='Market Details' />
					<div className='mt-4 flex flex-row gap-4'>
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
			<MarketBorrowModal asset={market} show={showBorrowModal} onHide={() => setShowBorrowModal(false)} />
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
