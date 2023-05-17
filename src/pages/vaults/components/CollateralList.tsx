import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import { ListHeader } from '@/components/List'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import useComposition from '@/hooks/baskets/useComposition'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { Balance } from '@/hooks/vaults/useBalances'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import RepayModal from './Modals/RepayModal'
import WithdrawModal from './Modals/WithdrawModal'

export const CollateralList = ({
	vaultName,
	collateral,
	supplyBalances,
	exchangeRates,
	accountBalances,
	accountVaults,
	borrowBalances,
}: {
	vaultName: string
	supplyBalances: Balance[]
	collateral: ActiveSupportedVault[]
	exchangeRates: any
	accountBalances: Balance[]
	accountVaults: ActiveSupportedVault[]
	borrowBalances: Balance[]
}) => {
	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Open Positions
			</Typography>
			<ListHeader headers={['Asset', 'Deposit', 'vAPY', '']} className='mx-4 pb-0 text-center text-baoWhite text-opacity-50' />
			{collateral
				.map((vault: ActiveSupportedVault) => (
					<CollateralListItem
						vault={vault}
						vaultName={vaultName}
						accountBalances={accountBalances}
						accountVaults={accountVaults}
						supplyBalances={supplyBalances}
						borrowBalances={borrowBalances}
						exchangeRates={exchangeRates}
						key={vault.vaultAddress}
					/>
				))
				.sort((a, b) => (a.props.vault.isSynth === true ? -1 : b.props.vault.isSynth === false ? 1 : 0))}
		</>
	)
}

const CollateralListItem: React.FC<CollateralListItemProps> = ({
	vault,
	vaultName,
	accountBalances,
	supplyBalances,
	borrowBalances,
	exchangeRates,
}: CollateralListItemProps) => {
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)
	const [showRepayModal, setShowRepayModal] = useState(false)
	const { account } = useWeb3React()

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances.find(balance => balance.address === vault.vaultAddress)
		if (supply === undefined) return BigNumber.from(0)
		if (exchangeRates[vault.vaultAddress] === undefined) return BigNumber.from(0)
		return decimate(supply.balance.mul(exchangeRates[vault.vaultAddress]))
	}, [supplyBalances, exchangeRates, vault.vaultAddress])

	const borrowed = useMemo(
		() => vault && borrowBalances.find(balance => balance.address === vault.vaultAddress).balance,
		[borrowBalances, vault],
	)

	// FIXME: Causes crash
	// const isInVault = useMemo(() => {
	// 	return accountVaults && vault && accountVaults.find(_vault => _vault.vaultAddress === vault.vaultAddress)
	// }, [accountVaults, vault])

	// const [isChecked, setIsChecked] = useState(!!isInVault)

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

	console.log(vaultName, 'isSynth?', vault.isSynth)
	console.log(vaultName, 'borrowed', borrowed.toString())
	console.log(vaultName, 'suppliedUnderlying', suppliedUnderlying.toString())

	return (
		<>
			<div className='glassmorphic-card my-4 p-2'>
				<div className='grid w-full grid-cols-12 items-center justify-center px-2'>
					<div className='items-left col-span-3 m-auto ml-0 text-start align-middle'>
						<Image
							src={`/images/tokens/${vault.icon}`}
							alt={`${vault.underlyingSymbol}`}
							width={24}
							height={24}
							className='inline-block select-none'
						/>
						<span className='inline-block text-left align-middle'>
							<Typography className='ml-2 font-bold leading-5'>{vault.underlyingSymbol}</Typography>
						</span>
					</div>
					<div className='col-span-3 mr-0 items-start'>
						<Tooltipped
							content={`$${getDisplayBalance((!vault.isSynth ? decimate(suppliedUnderlying) : decimate(borrowed)).mul(vault.price))}`}
							key={vault.underlyingSymbol}
							placement='top'
							className='rounded-full bg-baoRed font-bold'
						>
							<Typography className='text-center leading-5'>
								<span className='align-middle font-bold'>{`${getDisplayBalance(
									!vault.isSynth ? suppliedUnderlying : borrowed,
									vault.underlyingDecimals,
								)}`}</span>
							</Typography>
						</Tooltipped>
					</div>
					<div className='col-span-3 m-auto items-center justify-center'>
						<Typography className='font-bold leading-5'>
							{vault.isBasket && avgBasketAPY
								? getDisplayBalance(avgBasketAPY, 0, 2) + '%'
								: vault.isSynth
								? getDisplayBalance(vault.borrowApy, 18, 2) + '%'
								: '-'}
						</Typography>
					</div>

					<div className='col-span-3 m-auto mr-0 w-full items-end'>
						{!vault.isSynth ? (
							<Button fullWidth size='xs' onClick={() => setShowWithdrawModal(true)} disabled={!account}>
								Withdraw
							</Button>
						) : (
							<Button fullWidth size='xs' onClick={() => setShowRepayModal(true)} disabled={!account}>
								Repay
							</Button>
						)}
					</div>
				</div>
			</div>
			<WithdrawModal asset={vault} vaultName={vaultName} show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} />
			<RepayModal asset={vault} vaultName={vaultName} show={showRepayModal} onHide={() => setShowRepayModal(false)} />
		</>
	)
}

export default CollateralList

type CollateralListItemProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountBalances?: Balance[]
	accountVaults?: ActiveSupportedVault[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
