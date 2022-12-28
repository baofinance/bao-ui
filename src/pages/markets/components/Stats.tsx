import { ActiveSupportedMarket } from '@/bao/lib/types'
import { StatBlock } from '@/components/Stats'
import { useAccountLiquidity } from '@/hooks/markets/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { MarketOperations } from './Modals/Modals'

type MarketStatBlockProps = {
	title?: string
	asset: ActiveSupportedMarket
	amount?: BigNumber
}

type MarketStatProps = {
	asset: ActiveSupportedMarket
	amount: string
	operation: MarketOperations
}

const SupplyDetails = ({ asset }: MarketStatBlockProps) => {
	const supplyBalances = useSupplyBalances()
	const balances = useAccountBalances()
	const { exchangeRates } = useExchangeRates()

	const supplyBalance = useMemo(
		() =>
			supplyBalances &&
			supplyBalances.find(balance => balance.address.toLowerCase() === asset.marketAddress.toLowerCase()) &&
			exchangeRates &&
			exchangeRates[asset.marketAddress]
				? decimate(
						supplyBalances
							.find(balance => balance.address.toLowerCase() === asset.marketAddress.toLowerCase())
							.balance.mul(exchangeRates[asset.marketAddress]),
				  )
				: BigNumber.from(0),
		[supplyBalances, exchangeRates, asset.marketAddress],
	)
	const walletBalance = useMemo(
		() =>
			balances && balances.find(_balance => _balance.address === asset.underlyingAddress)
				? balances.find(_balance => _balance.address === asset.underlyingAddress).balance
				: BigNumber.from(0),
		[balances, asset.underlyingAddress],
	)

	const supplyBalanceUsd = useMemo(() => {
		if (!supplyBalance) return '0'
		// FIXME: needs decimals
		return getDisplayBalance(decimate(asset.price.mul(supplyBalance)))
	}, [supplyBalance, asset.price])

	const walletBalanceUsd = useMemo(() => {
		if (!walletBalance) return
		return getDisplayBalance(decimate(asset.price.mul(walletBalance)))
	}, [walletBalance, asset.price])

	return (
		<StatBlock
			label='Supply Stats'
			stats={[
				{
					label: 'Supply APY',
					value: `${asset.supplyApy}%`,
				},
				{
					label: 'Supply Balance',
					value: `${getDisplayBalance(supplyBalance)} ${asset.underlyingSymbol} | $${supplyBalanceUsd || '~'}`,
				},
				{
					label: 'Wallet Balance',
					value: `${getDisplayBalance(walletBalance)} ${asset.underlyingSymbol} | $${walletBalanceUsd || '~'}`,
				},
			]}
		/>
	)
}

export const MarketDetails = ({ asset, title }: MarketStatBlockProps) => {
	return (
		<StatBlock
			label={title}
			stats={[
				{
					label: 'Collateral Factor',
					value: `${getDisplayBalance(asset.collateralFactor.mul(100), 18, 0)}%`,
				},
				{
					label: 'Initial Margin Factor',
					value: `${getDisplayBalance(asset.imfFactor.mul(100), 18, 0)}%`,
				},
				{
					label: 'Reserve Factor',
					value: `${getDisplayBalance(asset.reserveFactor.mul(100), 18, 0)}%`,
				},
				{
					label: 'Total Reserves',
					value: `$${getDisplayBalance(asset.totalReserves.mul(asset.price), 18 + asset.underlyingDecimals)}`,
				},
			]}
		/>
	)
}

const MintDetails = ({ asset }: MarketStatBlockProps) => {
	const borrowBalances = useBorrowBalances()
	const balances = useAccountBalances()

	const borrowBalance = useMemo(
		() =>
			borrowBalances && borrowBalances.find(_borrowBalance => _borrowBalance.address === asset.marketAddress)
				? borrowBalances.find(_borrowBalance => _borrowBalance.address === asset.marketAddress).balance
				: 0,
		[borrowBalances, asset.marketAddress],
	)
	const walletBalance = useMemo(
		() =>
			balances && balances.find(_balance => _balance.address === asset.underlyingAddress)
				? balances.find(_balance => _balance.address === asset.underlyingAddress).balance
				: 0,
		[balances, asset.underlyingAddress],
	)

	const price = useMemo(() => {
		if (!borrowBalance) return
		return getDisplayBalance(decimate(asset.price.mul(borrowBalance)))
	}, [borrowBalance, asset.price])

	return (
		<StatBlock
			label='Mint Info'
			stats={[
				{
					label: 'APY',
					value: `${getDisplayBalance(asset.borrowApy)}%`,
				},
				{
					label: 'Debt Balance',
					value: `${getDisplayBalance(borrowBalance)} ${asset.underlyingSymbol} | $${price || '~'}`,
				},
				{
					label: 'Wallet Balance',
					value: `${getDisplayBalance(walletBalance)} ${asset.underlyingSymbol}`,
				},
			]}
		/>
	)
}

const DebtLimit = ({ asset, amount }: MarketStatBlockProps) => {
	const accountLiquidity = useAccountLiquidity()
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(accountLiquidity.usdBorrowable) : BigNumber.from(0)
	const change = amount ? decimate(asset.collateralFactor.mul(amount).mul(asset.price), 36) : BigNumber.from(0)
	const newBorrowable = borrowable.add(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

	return (
		<div className='mt-4'>
			<StatBlock
				label='Debt Limit Stats'
				stats={[
					{
						label: 'Debt Limit',
						value: `$${getDisplayBalance(borrowable)} ➜ $${getDisplayBalance(newBorrowable)}`,
					},
					{
						label: 'Debt Limit Used',
						value: `${getDisplayBalance(
							accountLiquidity && !borrowable.eq(0) ? exponentiate(accountLiquidity.usdBorrow).div(borrowable).mul(100) : 0,
							18,
							2,
						)}% ➜ ${getDisplayBalance(accountLiquidity && exponentiate(accountLiquidity.usdBorrow).div(newBorrowable).mul(100), 18, 2)}%`,
					},
				]}
			/>
		</div>
	)
}

const DebtLimitRemaining = ({ asset, amount }: MarketStatBlockProps) => {
	const accountLiquidity = useAccountLiquidity()
	const change = amount ? decimate(BigNumber.from(amount).mul(asset.price)) : BigNumber.from(0)
	const borrow = accountLiquidity ? accountLiquidity.usdBorrow : BigNumber.from(0)
	const newBorrow = borrow ? borrow.sub(change.gt(0) ? change : 0) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(accountLiquidity.usdBorrowable) : BigNumber.from(0)
	const newBorrowable = borrowable.add(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))
	console.log('change', change.toString())
	console.log('borrow', borrow.toString())
	console.log('newBorrow', newBorrow.toString())
	console.log('borrowable', borrowable.toString())
	console.log('newBorrowable', newBorrowable.toString())

	return (
		<div className='mt-4'>
			<StatBlock
				label='Debt Limit Stats'
				stats={[
					{
						label: 'Debt Limit Remaining',
						value: `$${getDisplayBalance(accountLiquidity ? accountLiquidity.usdBorrowable : BigNumber.from(0))} ➜ $${getDisplayBalance(
							accountLiquidity ? accountLiquidity.usdBorrowable.add(change) : BigNumber.from(0),
						)}`,
					},
					{
						// FIXME: Fix this for when a users current borrow amount is zero
						label: 'Debt Limit Used',
						value: `${getDisplayBalance(
							!borrowable.eq(0) ? exponentiate(borrow).div(borrowable).mul(100) : 0,
							18,
							2,
						)}% ➜ ${getDisplayBalance(!newBorrowable.eq(0) ? exponentiate(newBorrow).div(newBorrowable).mul(100) : 0, 18, 2)}%`,
					},
				]}
			/>
		</div>
	)
}

const MarketStats = ({ operation, asset, amount }: MarketStatProps) => {
	const parsedAmount = amount ? parseUnits(amount) : BigNumber.from(0)
	switch (operation) {
		case MarketOperations.supply:
			return (
				<>
					<SupplyDetails asset={asset} />
					<DebtLimit asset={asset} amount={parsedAmount} />
				</>
			)
		case MarketOperations.withdraw:
			return (
				<>
					<SupplyDetails asset={asset} />
					<DebtLimit asset={asset} amount={parsedAmount.mul(-1)} />
				</>
			)
		case MarketOperations.mint:
			return (
				<>
					<MintDetails asset={asset} />
					<DebtLimitRemaining asset={asset} amount={parsedAmount.mul(-1)} />
				</>
			)
		case MarketOperations.repay:
			return (
				<>
					<MintDetails asset={asset} />
					<DebtLimitRemaining asset={asset} amount={parsedAmount} />
				</>
			)
	}
}

export default MarketStats
