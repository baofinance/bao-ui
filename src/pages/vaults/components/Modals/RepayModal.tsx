/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useApprovals } from '@/hooks/vaults/useApprovals'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { Erc20 } from '@/typechain/Erc20'
import { decimate, exponentiate, getDisplayBalance, sqrt } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import { MoonLoader } from 'react-spinners'

export type RepayModalProps = {
	asset: ActiveSupportedVault
	show: boolean
	onHide: () => void
	vaultName: string
}

const RepayModal = ({ asset, show, onHide, vaultName }: RepayModalProps) => {
	const [val, setVal] = useState<string>('')
	const balances = useAccountBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)
	const { approvals } = useApprovals(vaultName)
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress)

	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const { vaultContract } = asset

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
		if (borrowBalances && balances) {
			const borrowBalance = borrowBalances.find(_balance => _balance.address.toLowerCase() === asset.vaultAddress.toLowerCase()).balance
			const walletBalance = balances.find(_balance => _balance.address.toLowerCase() === asset.underlyingAddress.toLowerCase()).balance
			return walletBalance.lt(borrowBalance) ? walletBalance : borrowBalance
		} else {
			return BigNumber.from(0)
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
					<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
						<Typography variant='xl' className='mr-1 inline-block'>
							Repay
						</Typography>
						<Image src={`/images/tokens/${asset.icon}`} width={32} height={32} alt={asset.underlyingSymbol} />
					</div>
				</Modal.Header>
				<>
					<Modal.Body>
						<div className='mb-4 flex h-full flex-col items-center justify-center'>
							<div className='flex w-full flex-row'>
								<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Availalble:
									</Typography>
									<Typography variant='sm' className='font-bakbak'>{`${getDisplayBalance(max(), asset.underlyingDecimals)} ${
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
					</Modal.Body>
					<Modal.Actions>
						{!pendingTx ? (
							approvals && (asset.underlyingAddress === 'ETH' || approvals[asset.underlyingAddress].gt(0)) ? (
								<Button
									fullWidth
									className='!rounded-full'
									disabled={!val || (val && parseUnits(val, asset.underlyingDecimals).gt(max()))}
									onClick={() => {
										let repayTx
										if (asset.underlyingAddress === 'ETH') {
											// @ts-ignore
											repayTx = vaultContract.repayBorrow({
												value: parseUnits(val, asset.underlyingDecimals),
											})
										} else {
											repayTx = vaultContract.repayBorrow(parseUnits(val, asset.underlyingDecimals))
										}
										handleTx(
											repayTx,
											`${vaultName} Vault: Repay ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
											() => onHide(),
										)
									}}
								>
									Repay
								</Button>
							) : (
								<Button
									fullWidth
									className='!rounded-full'
									disabled={!approvals || !val}
									onClick={() => {
										// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
										const tx = erc20.approve(vaultContract.address, ethers.constants.MaxUint256)
										handleTx(tx, `${vaultName} Vault: Approve ${asset.underlyingSymbol}`)
									}}
								>
									Approve
								</Button>
							)
						) : (
							<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
								<Button fullWidth className='!rounded-full'>
									<MoonLoader size={16} speedMultiplier={0.8} color='#e21a53' className='mr-2 mt-1 align-middle' />
									Pending Transaction
									<FontAwesomeIcon icon={faExternalLink} className='ml-2 text-baoRed' />
								</Button>
							</a>
						)}
					</Modal.Actions>
				</>
			</Modal>
		</>
	)
}

export default RepayModal
