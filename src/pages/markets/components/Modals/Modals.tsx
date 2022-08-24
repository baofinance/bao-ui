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
import { decimate, exponentiate } from '@/utils/numberFormat'
import BigNumber from 'bignumber.js'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'
import { MarketButton } from '../MarketButton'
import { MarketStats } from '../Stats'

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

	const supply =
		supplyBalances && exchangeRates
			? supplyBalances.find(_balance => _balance.address.toLowerCase() === asset.marketAddress.toLowerCase()).balance *
			  decimate(exchangeRates[asset.marketAddress]).toNumber()
			: 0

	const _imfFactor = accountLiquidity ? 1.1 / (1 + asset.imfFactor * Math.sqrt(supply)) : 0

	const withdrawable = accountLiquidity
		? _imfFactor > asset.collateralFactor
			? accountLiquidity.usdBorrowable / (asset.collateralFactor * asset.price)
			: accountLiquidity.usdBorrowable / (_imfFactor * asset.price)
		: 0

	const max = () => {
		switch (operation) {
			case MarketOperations.supply:
				return balances ? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance : 0
			case MarketOperations.withdraw:
				return !(accountLiquidity && accountLiquidity.usdBorrowable) || withdrawable > supply ? supply : withdrawable
			case MarketOperations.mint:
				return prices && accountLiquidity ? accountLiquidity.usdBorrowable / asset.price : 0
			case MarketOperations.repay:
				if (borrowBalances && balances) {
					const borrowBalance = borrowBalances.find(
						_balance => _balance.address.toLowerCase() === asset.marketAddress.toLowerCase(),
					).balance
					const walletBalance = balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
					return walletBalance < borrowBalance ? walletBalance : borrowBalance
				} else {
					return 0
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
					<div className='flex h-full flex-col items-center justify-center mb-4'>
						<div className='flex w-full flex-row'>
							<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
								<Typography variant='sm' className='text-text-200'>
									{`${maxLabel()}:`}
								</Typography>
								<Typography variant='sm'>{`${max().toFixed(4)} ${asset.underlyingSymbol}`}</Typography>
							</div>
						</div>
						<Input
							value={val}
							onChange={handleChange}
							onSelectMax={() => setVal((Math.floor(max() * 10 ** asset.underlyingDecimals) / 10 ** asset.underlyingDecimals).toString())}
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
						val={val && !isNaN(val as any as number) ? exponentiate(val, asset.underlyingDecimals) : new BigNumber(0)}
						isDisabled={!val || !bao || isNaN(val as any as number) || parseFloat(val) > max()}
						onHide={hideModal}
					/>
				</Modal.Actions>
			</Modal>
		</>
	)
}

export default MarketModal
