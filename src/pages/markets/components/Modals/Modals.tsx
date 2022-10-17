import { ActiveSupportedMarket } from '@/bao/lib/types'
import { NavButtons } from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import { useAccountLiquidity } from '@/hooks/markets/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { useMarketPrices } from '@/hooks/markets/usePrices'
import { decimate, getDisplayBalance, exponentiate, sqrt } from '@/utils/numberFormat'
import { BigNumber, FixedNumber, utils } from 'ethers'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import Image from 'next/image'
import React, { useCallback, useMemo, useState } from 'react'
import MarketButton from '../MarketButton'
import MarketStats from '../Stats'

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	mint = 'Mint',
	repay = 'Repay',
}

export type MarketModalProps = {
	asset: ActiveSupportedMarket
	show: boolean
	onHide: () => void
}

const MarketModal = ({ operations, asset, show, onHide }: MarketModalProps & { operations: MarketOperations[] }) => {
	const [operation, setOperation] = useState(operations[0])
	const [val, setVal] = useState<string>('')
	const bao = useBao()
	const balances = useAccountBalances()
	const borrowBalances = useBorrowBalances()
	const supplyBalances = useSupplyBalances()
	const accountLiquidity = useAccountLiquidity()
	const { exchangeRates } = useExchangeRates()
	const { prices } = useMarketPrices()

	const supply = useMemo(
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

	let _imfFactor = asset.imfFactor
	if (accountLiquidity) {
		const _sqrt = sqrt(supply)
		const num = exponentiate(parseUnits('1.1'))
		const denom = decimate(asset.imfFactor.mul(_sqrt).add(parseUnits('1')))
		_imfFactor = num.div(denom)
	}

	let withdrawable = BigNumber.from(0)
	if (_imfFactor.gt(asset.collateralFactor)) {
		if (asset.collateralFactor.mul(asset.price).gt(0)) {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(asset.collateralFactor.mul(asset.price)))
		} else {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(_imfFactor).mul(asset.price))
		}
	}

	const max = () => {
		switch (operation) {
			case MarketOperations.supply:
				return balances
					? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
					: BigNumber.from(0)
			//Broken
			case MarketOperations.withdraw:
				return !(accountLiquidity && accountLiquidity.usdBorrowable) || withdrawable.gt(supply) ? supply : withdrawable
			//Broken
			case MarketOperations.mint:
				return prices && accountLiquidity
					? BigNumber.from(
							FixedNumber.from(formatUnits(accountLiquidity && accountLiquidity.usdBorrowable)).divUnsafe(
								FixedNumber.from(formatUnits(asset.price)),
							),
					  )
					: BigNumber.from(0)
			case MarketOperations.repay:
				if (borrowBalances && balances) {
					const borrowBalance = borrowBalances.find(
						_balance => _balance.address.toLowerCase() === asset.marketAddress.toLowerCase(),
					).balance
					const walletBalance = balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
					return walletBalance.lt(borrowBalance) ? walletBalance : borrowBalance
				} else {
					return BigNumber.from(0)
				}
		}
	}

	console.log()

	const maxLabel = () => {
		switch (operation) {
			case MarketOperations.supply:
				return 'Wallet'
			case MarketOperations.withdraw:
				return 'Withdrawable'
			case MarketOperations.mint:
				return 'Max Mint'
			case MarketOperations.repay:
				return 'Max Repay'
		}
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const hideModal = useCallback(() => {
		onHide()
		setVal('')
	}, [onHide])

	return (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header onClose={hideModal}>
					<div className='mx-0 my-auto flex h-full items-center text-text-100'>
						<Typography variant='xl' className='mr-1 inline-block font-semibold'>
							{operation}
						</Typography>
						<Image src={`/images/tokens/${asset.icon}`} width={32} height={32} alt={asset.underlyingSymbol} />
					</div>
				</Modal.Header>
				<Modal.Options>
					<NavButtons options={operations} active={operation} onClick={setOperation} />
				</Modal.Options>
				<Modal.Body>
					<div className='mb-4 flex h-full flex-col items-center justify-center'>
						<div className='flex w-full flex-row'>
							<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
								<Typography variant='sm' className='text-text-200'>
									{`${maxLabel()}:`}
								</Typography>
								<Typography variant='sm'>{`${getDisplayBalance(max(), asset.underlyingDecimals)} ${asset.underlyingSymbol}`}</Typography>
							</div>
						</div>
						<Input
							value={val}
							onChange={handleChange}
							onSelectMax={() => setVal(formatUnits(max(), asset.underlyingDecimals))}
							label={
								<div className='flex flex-row items-center pl-2 pr-4'>
									<div className='flex w-6 justify-center'>
										<Image
											src={`/images/tokens/${asset.icon}`}
											width={32}
											height={32}
											alt={asset.symbol}
											className='block h-6 w-6 align-middle'
										/>
									</div>
								</div>
							}
						/>
					</div>
					<MarketStats operation={operation} asset={asset} amount={val} />
				</Modal.Body>
				<Modal.Actions>
					<MarketButton
						operation={operation}
						asset={asset}
						val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
						isDisabled={!val || (val && parseUnits(val, asset.underlyingDecimals).gt(max()))}
						onHide={hideModal}
					/>
				</Modal.Actions>
			</Modal>
		</>
	)
}

export default MarketModal
