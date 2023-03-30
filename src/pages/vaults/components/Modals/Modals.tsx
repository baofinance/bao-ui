import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import { NavButtons } from '@/components/Button'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useBallastInfo from '@/hooks/vaults/useBallastInfo'
import useTokenBalance, { useEthBalance } from '@/hooks/base/useTokenBalance'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import BallastButton from '../BallastButton'
import { decimate, exponentiate, getDisplayBalance, sqrt } from '@/utils/numberFormat'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, FixedNumber } from 'ethers'
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import VaultStats from '../Stats'
import VaultButton from '../VaultButton'

export enum VaultOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	mint = 'Mint',
	repay = 'Repay',
	ballast = 'Ballast',
}

export type VaultModalProps = {
	asset: ActiveSupportedVault
	show: boolean
	onHide: () => void
	vaultName: string
}

const VaultModal = ({ operations, asset, show, onHide, vaultName }: VaultModalProps & { operations: VaultOperations[] }) => {
	const { library, account } = useWeb3React()
	const [operation, setOperation] = useState(operations[0])
	const [val, setVal] = useState<string>('')
	const balances = useAccountBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)
	const { prices } = useVaultPrices(vaultName)

	const supply = useMemo(
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

	let _imfFactor = asset.imfFactor
	if (accountLiquidity) {
		const _sqrt = sqrt(supply)
		const num = exponentiate(parseUnits('1.1'))
		const denom = decimate(asset.imfFactor.mul(_sqrt).add(parseUnits('1')))
		_imfFactor = num.div(denom)
	}

	let withdrawable = BigNumber.from(0)
	if (_imfFactor.gt(asset.collateralFactor) && asset.price.gt(0)) {
		if (asset.collateralFactor.mul(asset.price).gt(0)) {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(asset.collateralFactor.mul(asset.price)))
		} else {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(_imfFactor).mul(asset.price))
		}
	}

	const max = () => {
		switch (operation) {
			case VaultOperations.supply:
				return balances
					? balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
					: BigNumber.from(0)
			//Broken
			case VaultOperations.withdraw:
				return !(accountLiquidity && accountLiquidity.usdBorrowable) || withdrawable.gt(supply) ? supply : withdrawable
			//Broken
			case VaultOperations.mint:
				return prices && accountLiquidity && asset.price.gt(0)
					? BigNumber.from(
							FixedNumber.from(formatUnits(accountLiquidity && accountLiquidity.usdBorrowable)).divUnsafe(
								FixedNumber.from(formatUnits(asset.price)),
							),
					  )
					: BigNumber.from(0)
			case VaultOperations.repay:
				if (borrowBalances && balances) {
					const borrowBalance = borrowBalances.find(_balance => _balance.address.toLowerCase() === asset.vaultAddress.toLowerCase()).balance
					const walletBalance = balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
					return walletBalance.lt(borrowBalance) ? walletBalance : borrowBalance
				} else {
					return BigNumber.from(0)
				}
		}
	}

	const maxLabel = () => {
		switch (operation) {
			case VaultOperations.supply:
				return 'Wallet'
			case VaultOperations.withdraw:
				return 'Withdrawable'
			case VaultOperations.mint:
				return 'Max Mint'
			case VaultOperations.repay:
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

	// Ballast
	const [swapDirection, setSwapDirection] = useState(false) // false = DAI->baoUSD | true = baoUSD->DAI
	const [inputVal, setInputVal] = useState('')
	const ethBalance = useEthBalance()
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const baoUSDBalance = useTokenBalance(Config.addressMap.baoUSD)
	const baoETHBalance = useTokenBalance(Config.addressMap.baoETH)
	const ballastInfo = useBallastInfo(vaultName)

	const aInput = (
		<>
			<Typography variant='sm' className='float-left mb-1'>
				Balance: {vaultName === 'baoUSD' ? `${getDisplayBalance(daiBalance)} DAI` : `${getDisplayBalance(ethBalance)} ETH`}
			</Typography>
			<Typography variant='sm' className='float-right mb-1 text-text-200'>
				Reserves: {ballastInfo ? getDisplayBalance(ballastInfo.reserves) : <Loader />}{' '}
			</Typography>
			<Input
				onSelectMax={() => setInputVal(formatEther(vaultName === 'baoUSD' ? daiBalance : ethBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${vaultName === 'baoUSD' ? 'DAI' : 'ETH'}.png`}
								height={32}
								width={32}
								alt={vaultName === 'baoUSD' ? 'DAI' : 'ETH'}
							/>
						</div>
					</div>
				}
			/>
		</>
	)

	const bInput = (
		<>
			<Typography variant='sm' className='float-left mb-1'>
				Balance: {vaultName === 'baoUSD' ? `${getDisplayBalance(baoUSDBalance)} baoUSD` : `${getDisplayBalance(baoETHBalance)} baoETH`}
			</Typography>
			<Typography variant='sm' className='float-right mb-1 text-text-200'>
				Mint Limit: {ballastInfo ? getDisplayBalance(ballastInfo.supplyCap) : <Loader />}{' '}
			</Typography>
			<Input
				onSelectMax={() => setInputVal(formatEther(vaultName === 'baoUSD' ? baoUSDBalance : baoETHBalance).toString())}
				onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setInputVal(e.currentTarget.value)}
				// Fee calculation not ideal, fix.
				value={
					!swapDirection && ballastInfo && inputVal ? (parseFloat(inputVal) - parseFloat(inputVal) * (100 / 10000)).toString() : inputVal
				}
				disabled={!swapDirection}
				label={
					<div className='flex flex-row items-center pl-2 pr-4'>
						<div className='flex w-6 justify-center'>
							<Image
								src={`/images/tokens/${vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}.png`}
								height={32}
								width={32}
								alt={vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}
							/>
						</div>
					</div>
				}
			/>
		</>
	)

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
				{operation !== VaultOperations.ballast ? (
					<>
						<Modal.Body>
							<div className='mb-4 flex h-full flex-col items-center justify-center'>
								<div className='flex w-full flex-row'>
									<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
										<Typography variant='sm' className='text-text-200'>
											{`${maxLabel()}:`}
										</Typography>
										<Typography variant='sm'>{`${getDisplayBalance(max(), asset.underlyingDecimals)} ${
											asset.underlyingSymbol
										}`}</Typography>
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
							<VaultStats operation={operation} asset={asset} amount={val} vaultName={vaultName} />
						</Modal.Body>
						<Modal.Actions>
							<VaultButton
								vaultName={vaultName}
								operation={operation}
								asset={asset}
								val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
								isDisabled={
									!val ||
									(val && parseUnits(val, asset.underlyingDecimals).gt(max())) ||
									// FIXME: temporarily limit minting/borrowing to 5k baoUSD.
									(val &&
										vaultName === 'baoUSD' &&
										parseUnits(val, asset.underlyingDecimals).lt(parseUnits('5000')) &&
										operation === VaultOperations.mint)
								}
								onHide={hideModal}
							/>
						</Modal.Actions>
					</>
				) : (
					<>
						<Modal.Body>
							{swapDirection ? bInput : aInput}
							<div className='mt-4 block select-none text-center'>
								<span
									className='m-auto mb-2 flex w-fit items-center justify-center gap-1 rounded-full border-none bg-primary-300 p-2 text-lg hover:cursor-pointer hover:bg-primary-400'
									onClick={() => setSwapDirection(!swapDirection)}
								>
									<FontAwesomeIcon icon={faSync} size='xs' className='m-auto' />
									<Typography variant='xs' className='inline'>
										Fee: {ballastInfo ? `${(100 / 10000) * 100}%` : <Loader />}
									</Typography>
								</span>
							</div>
							{swapDirection ? aInput : bInput}
							<div className='h-4' />
						</Modal.Body>
						<Modal.Actions>
							<BallastButton
								swapDirection={swapDirection}
								inputVal={inputVal}
								maxValues={{
									buy: vaultName === 'baoUSD' ? daiBalance : ethBalance,
									sell: vaultName === 'baoUSD' ? baoUSDBalance : baoETHBalance,
								}}
								supplyCap={ballastInfo ? ballastInfo.supplyCap : BigNumber.from(0)}
								reserves={ballastInfo ? ballastInfo.reserves : BigNumber.from(0)}
							/>
						</Modal.Actions>
					</>
				)}
			</Modal>
		</>
	)
}

export default VaultModal
