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
import { decimate, getDisplayBalance, exponentiate } from '@/utils/numberFormat'
import { BigNumber, utils } from 'ethers'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'
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

	//console.log(balances, borrowBalances, supplyBalances, accountLiquidity, exchangeRates, prices)
	//console.log(prices)

	const supply =
		supplyBalances && exchangeRates
			? supplyBalances.find(_balance => _balance.address.toLowerCase() === asset.marketAddress.toLowerCase()).balance
				.mul(exchangeRates[asset.marketAddress])
			: BigNumber.from(0)

	//const _imfFactor = accountLiquidity
		//? parseUnits('1.1').div(asset.imfFactor.mul(Math.sqrt(supply)).add(parseUnits('1')))
		//: 0
	let _imfFactor = BigNumber.from(0)
	if (accountLiquidity) {
		const num = parseUnits('1.1')
		const sqrt = parseUnits(Math.sqrt(parseFloat(formatUnits(supply))).toString())
		const denom = asset.imfFactor.mul(sqrt).add(parseUnits('1'))
		_imfFactor = num.div(denom)
		console.log("sqrt", formatUnits(sqrt))
	console.log("imf", _imfFactor.toString(), num.toString(), denom.toString())
	}

	let withdrawable = BigNumber.from(0)
	if (_imfFactor.gt(asset.collateralFactor)) {
		if (asset.collateralFactor.mul(asset.price).gt(0)) {
			withdrawable = accountLiquidity.usdBorrowable.div(asset.collateralFactor.mul(asset.price))
		} else if (_imfFactor.mul(asset.price)) {
			withdrawable = accountLiquidity.usdBorrowable.div(_imfFactor.mul(asset.price))
		}
	}

	const max = () => {
		switch (operation) {
			case MarketOperations.supply:
				return balances
					? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
					: BigNumber.from(0)
			case MarketOperations.withdraw:
				return !(accountLiquidity && accountLiquidity.usdBorrowable) || withdrawable > supply ? supply : withdrawable
			case MarketOperations.mint:
				return prices && accountLiquidity ? accountLiquidity.usdBorrowable.div(asset.price) : BigNumber.from(0)
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
								<Typography variant='sm'>{`${getDisplayBalance(max())} ${asset.underlyingSymbol}`}</Typography>
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
						isDisabled={!val || (val && parseUnits(val).gt(max()))}
						onHide={hideModal}
					/>
				</Modal.Actions>
			</Modal>
		</>
	)
}

export default MarketModal
