import { ActiveSupportedVault } from '@/bao/lib/types'
import { StatBlock } from '@/components/Stats'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { VaultOperations } from './Modals/Modals'

type VaultStatBlockProps = {
	title?: string
	asset: ActiveSupportedVault
	amount?: BigNumber
	vaultName: string
}

type VaultStatProps = {
	asset: ActiveSupportedVault
	amount: string
	operation: VaultOperations
	vaultName: string
}

export const SupplyDetails = ({ asset, vaultName }: VaultStatBlockProps) => {
	const supplyBalances = useSupplyBalances(vaultName)
	const balances = useAccountBalances(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)

	const supplyBalance = useMemo(
		() =>
			supplyBalances &&
			supplyBalances.find(balance => balance.address.toLowerCase() === asset.vaultAddress.toLowerCase()) &&
			exchangeRates &&
			exchangeRates[asset.vaultAddress]
				? decimate(
						supplyBalances
							.find(balance => balance.address.toLowerCase() === asset.vaultAddress.toLowerCase())
							.balance.mul(exchangeRates[asset.vaultAddress]),
				  )
				: BigNumber.from(0),
		[supplyBalances, exchangeRates, asset.vaultAddress],
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
					value: `${getDisplayBalance(supplyBalance, asset.underlyingDecimals)} ${asset.underlyingSymbol} | $${supplyBalanceUsd || '~'}`,
				},
				{
					label: 'Wallet Balance',
					value: `${getDisplayBalance(walletBalance, asset.underlyingDecimals)} ${asset.underlyingSymbol} | $${walletBalanceUsd || '~'}`,
				},
			]}
		/>
	)
}

export const VaultDetails = ({ asset, title }: VaultStatBlockProps) => {
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

export const MintDetails = ({ asset, vaultName }: VaultStatBlockProps) => {
	const borrowBalances = useBorrowBalances(vaultName)
	const balances = useAccountBalances(vaultName)

	const borrowBalance = useMemo(
		() =>
			borrowBalances && borrowBalances.find(_borrowBalance => _borrowBalance.address === asset.vaultAddress)
				? borrowBalances.find(_borrowBalance => _borrowBalance.address === asset.vaultAddress).balance
				: 0,
		[borrowBalances, asset.vaultAddress],
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

export const DebtLimit = ({ asset, amount, vaultName }: VaultStatBlockProps) => {
	const accountLiquidity = useAccountLiquidity(vaultName)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const change = amount ? decimate(asset.collateralFactor.mul(amount).mul(asset.price), 36) : BigNumber.from(0)
	const newBorrowable = decimate(borrowable).add(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

	return (
		<div className='mt-4'>
			<StatBlock
				label='Debt Limit Stats'
				stats={[
					{
						label: 'Debt Limit',
						value: `$${getDisplayBalance(decimate(borrowable))} ➜ $${getDisplayBalance(newBorrowable)}`,
					},
					{
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
				]}
			/>
		</div>
	)
}

export const DebtLimitRemaining = ({ asset, amount, vaultName }: VaultStatBlockProps) => {
	const accountLiquidity = useAccountLiquidity(vaultName)
	const change = amount ? decimate(BigNumber.from(amount).mul(asset.price)) : BigNumber.from(0)
	const borrow = accountLiquidity ? accountLiquidity.usdBorrow : BigNumber.from(0)
	const newBorrow = borrow ? borrow.sub(change.gt(0) ? change : 0) : BigNumber.from(0)
	const borrowable = accountLiquidity ? accountLiquidity.usdBorrow.add(exponentiate(accountLiquidity.usdBorrowable)) : BigNumber.from(0)
	const newBorrowable = decimate(borrowable).add(BigNumber.from(parseUnits(formatUnits(change, 36 - asset.underlyingDecimals))))

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
						)}% ➜ ${getDisplayBalance(!newBorrowable.eq(0) ? newBorrow.div(newBorrowable).mul(100) : 0, 18, 2)}%`,
					},
				]}
			/>
		</div>
	)
}

const VaultStats = ({ operation, asset, amount, vaultName }: VaultStatProps) => {
	const parsedAmount = amount ? parseUnits(amount) : BigNumber.from(0)
	switch (operation) {
		case VaultOperations.supply:
			return (
				<>
					<SupplyDetails asset={asset} vaultName={vaultName} />
					<DebtLimit asset={asset} amount={parsedAmount} vaultName={vaultName} />
				</>
			)
		case VaultOperations.withdraw:
			return (
				<>
					<SupplyDetails asset={asset} vaultName={vaultName} />
					<DebtLimit asset={asset} amount={parsedAmount.mul(-1)} vaultName={vaultName} />
				</>
			)
		case VaultOperations.mint:
			return (
				<>
					<MintDetails asset={asset} vaultName={vaultName} />
					<DebtLimitRemaining asset={asset} amount={parsedAmount.mul(-1)} vaultName={vaultName} />
				</>
			)
		case VaultOperations.repay:
			return (
				<>
					<MintDetails asset={asset} vaultName={vaultName} />
					<DebtLimitRemaining asset={asset} amount={parsedAmount} vaultName={vaultName} />
				</>
			)
	}
}

export default VaultStats
