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
import React, { useCallback, useMemo, useState } from 'react'

export const Positions = ({
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
				Your Collateral
			</Typography>
			<ListHeader headers={['Asset', 'Deposit', 'vAPY', '']} className='mx-4 pb-0 text-center text-baoWhite text-opacity-50' />
			{collateral.map((vault: ActiveSupportedVault) => (
				<OpenPosition
					vault={vault}
					vaultName={vaultName}
					accountBalances={accountBalances}
					accountVaults={accountVaults}
					supplyBalances={supplyBalances}
					borrowBalances={borrowBalances}
					exchangeRates={exchangeRates}
					key={vault.vaultAddress}
				/>
			))}{' '}
		</>
	)
}

const OpenPosition: React.FC<OpenPositionProps> = ({
	vault,
	vaultName,
	accountBalances,
	supplyBalances,
	exchangeRates,
}: OpenPositionProps) => {
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
			<div className='glassmorphic-card my-4 p-4'>
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
							content={`$${getDisplayBalance(decimate(suppliedUnderlying.mul(vault.price)))}`}
							key={vault.underlyingSymbol}
							placement='top'
							className='rounded-full bg-baoRed font-bold'
						>
							<Typography className='text-center leading-5'>
								<span className='align-middle font-bold'>{`${getDisplayBalance(suppliedUnderlying, vault.underlyingDecimals)}`}</span>
							</Typography>
						</Tooltipped>
					</div>
					<div className='col-span-3 m-auto items-center justify-center'>
						<Typography className='font-bold leading-5'>
							{vault.isBasket && avgBasketAPY ? getDisplayBalance(avgBasketAPY, 0, 2) + '%' : '-'}
						</Typography>
					</div>

					<div className='col-span-3 m-auto mr-0 items-end'>
						<Button size='xs'>Withdraw</Button>
					</div>
				</div>
			</div>
		</>
	)
}

export default Positions

type OpenPositionProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountBalances?: Balance[]
	accountVaults?: ActiveSupportedVault[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
