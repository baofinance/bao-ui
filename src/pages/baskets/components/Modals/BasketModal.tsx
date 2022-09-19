import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faExternalLinkAlt, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { ethers } from 'ethers'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

type ModalProps = {
	basket: ActiveSupportedBasket
	operation: string
	show: boolean
	hideModal: () => void
}

enum MintOption {
	DAI,
	ETH,
}

// TODO: Make the BasketModal a modular component that can work with different recipes and different input tokens.
const BasketModal: React.FC<ModalProps> = ({ basket, operation, show, hideModal }) => {
	const [value, setValue] = useState<string | undefined>()
	const [secondaryValue, setSecondaryValue] = useState<string | undefined>()
	const [mintOption, setMintOption] = useState<MintOption>(MintOption.DAI)

	const bao = useBao()
	const { handleTx, pendingTx } = useTransactionHandler()
	const { account } = useWeb3React()
	const rates = useBasketRates(basket)

	// Get DAI approval
	const daiAllowance = useAllowance(Config.addressMap.DAI, bao && bao.getContract('recipe').address)

	// Get Basket & DAI balances
	const basketBalance = useTokenBalance(basket && basket.address)
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const ethBalance = useTokenBalance('ETH')

	const swapLink = basket && basket.swap

	const handleOperation = () => {
		let tx
		const recipe = bao.getContract('recipe')

		switch (operation) {
			case 'MINT':
				if (mintOption === MintOption.DAI) {
					// If DAI allowance is zero or insufficient, send an Approval TX
					if (daiAllowance.eq(0) || daiAllowance.lt(exponentiate(value))) {
						tx = bao.getNewContract(Config.addressMap.DAI, 'erc20.json').approve(
							recipe.address,
							ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
						)

						handleTx(tx, 'Approve DAI for Baskets Recipe')
						break
					}

					tx = recipe.bake(basket.address, exponentiate(value).toFixed(0), exponentiate(secondaryValue).toFixed(0))
				} else {
					// Else, use ETH to mint
					tx = recipe.toBasket(basket.address, exponentiate(secondaryValue).toFixed(0), {
						value: exponentiate(value).toFixed(0),
					})
				}

				handleTx(tx, `Mint ${getDisplayBalance(secondaryValue, 0) || 0} ${basket.symbol}`, () => hide())
				break
			case 'REDEEM':
				tx = basket.basketContract.exitPool(exponentiate(value).toFixed(0))

				handleTx(tx, `Redeem ${getDisplayBalance(new BigNumber(value), 0)} ${basket.symbol}`, () => hide())
		}
	}

	const isButtonDisabled = useMemo(
		() =>
			pendingTx !== false /* can be string | boolean */ ||
			(!(
				// First, check if we are minting, the mintOption is DAI, and the account has
				// inadequate approval. If so, the button needs to be enabled for the account
				// to approve DAI.
				(
					operation === 'MINT' &&
					mintOption === MintOption.DAI &&
					daiAllowance &&
					(daiAllowance.eq(0) || daiAllowance.lt(exponentiate(value)))
				)
			) &&
				// Else, check that the input value is valid.
				(!value ||
					!value.match(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/) ||
					new BigNumber(value).lte(0) ||
					new BigNumber(value).gt(
						decimate(operation === 'MINT' ? (mintOption === MintOption.DAI ? daiBalance : ethBalance) : basketBalance),
					))),
		[pendingTx, operation, mintOption, daiAllowance, value, daiBalance, ethBalance, basketBalance],
	)

	const hide = () => {
		hideModal()
		setValue(undefined)
		setSecondaryValue(undefined)
	}

	return basket ? (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header
					header={
						<div className='mx-0 my-auto flex h-full items-center gap-2 text-text-100'>
							{operation === 'MINT' ? 'Mint' : 'Redeem'} {basket.symbol}
							<Image src={`/images/tokens/${basket.icon}`} width={32} height={32} alt={basket.symbol} />
						</div>
					}
					onClose={hideModal}
				></Modal.Header>
				<Modal.Body>
					<div className='mb-4'>
						{operation === 'MINT' ? (
							<>
								<div className='mb-2 text-center'>
									<Badge>
										1 {basket.symbol} = <FontAwesomeIcon icon={faEthereum} /> {rates && getDisplayBalance(rates.eth)}
										{' = '}
										{rates && getDisplayBalance(rates.dai)} DAI
									</Badge>
								</div>
								<Typography variant='sm' className='text-center'>
									<b className='font-medium'>NOTE:</b> An extra 2% of the mint cost will be included to account for slippage. Any unused
									input tokens will be returned in the mint transaction.
								</Typography>
							</>
						) : (
							<Typography variant='sm' className='text-center'>
								<b className='font-medium'>NOTE:</b> When you redeem {basket.name}, you will receive the underlying tokens. Alternatively,
								you can swap {basket.name}{' '}
								<a href={`${swapLink}`} target='blank' className='font-semibold hover:text-text-400'>
									here
								</a>
								.{' '}
								<Badge className='mt-2 bg-red/50 text-center text-xs'>
									<b className='font-medium'>CAUTION:</b> Slippage may apply on swaps!
								</Badge>
							</Typography>
						)}
					</div>
					<div className='flex w-full flex-col'>
						<div className='flex h-full flex-col items-center justify-center'>
							<div className='flex w-full flex-row'>
								<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='text-text-200'>
										{`Available:`}
									</Typography>
									<Typography variant='sm'>
										{operation === 'MINT'
											? mintOption === MintOption.DAI
												? `${daiBalance && decimate(daiBalance).toFixed(4)} DAI`
												: `${ethBalance && decimate(ethBalance).toFixed(4)} ETH`
											: `${basketBalance && decimate(basketBalance).toFixed(4)} ${basket.symbol}`}
									</Typography>
								</div>
							</div>
							<Input
								value={value}
								onChange={e => setValue(e.currentTarget.value)}
								onSelectMax={() => setValue(decimate(basketBalance).toFixed(18))}
								disabled={operation === 'MINT'}
								label={
									<div className='flex flex-row items-center'>
										{operation === 'MINT' && (
											<>
												<Tooltipped content={`Swap input currency to ${mintOption === MintOption.DAI ? 'ETH' : 'DAI'}`}>
													<Button
														size='xs'
														onClick={() => {
															// Clear input values
															setValue('')
															setSecondaryValue('')
															// Swap mint option
															setMintOption(mintOption === MintOption.DAI ? MintOption.ETH : MintOption.DAI)
														}}
														className='mr-1'
													>
														<FontAwesomeIcon icon={faSync} />
													</Button>
												</Tooltipped>
											</>
										)}
										<div className='flex flex-row items-center pl-2 pr-4'>
											<div className='flex w-6 justify-center'>
												{operation === 'MINT' ? (
													<Image
														src={`/images/tokens/${mintOption === MintOption.DAI ? 'DAI' : 'ETH'}.png`}
														width={32}
														height={32}
														alt={mintOption.toString()}
													/>
												) : (
													<Image src={`/images/tokens/${basket.icon}`} width={32} height={32} alt={basket.symbol} />
												)}
											</div>
										</div>
									</div>
								}
							/>
							{operation === 'MINT' && rates && (
								<>
									<br />
									<Input
										value={secondaryValue}
										onChange={e => {
											const inputVal = decimate(mintOption === MintOption.DAI ? rates.dai : rates.eth)
												.times(e.currentTarget.value)
												.times(1.02)
											setSecondaryValue(e.currentTarget.value)
											setValue(
												inputVal.isFinite() ? inputVal.toFixed(18) : '0', // Pad an extra 2% ETH. It will be returned to the user if it is not used.
											)
										}}
										onSelectMax={() => {
											// Seek to mint 98% of total value (use remaining 2% as slippage protection)
											let usedBal
											let usedRate
											switch (mintOption) {
												case MintOption.DAI:
													usedBal = decimate(daiBalance)
													usedRate = rates.dai
													break
												case MintOption.ETH:
													usedBal = decimate(ethBalance)
													usedRate = rates.eth
													break
											}

											const maxVal = usedBal.times(0.98)
											setSecondaryValue(maxVal.div(decimate(usedRate)).toFixed(18))
											setValue(usedBal.toString())
										}}
										label={
											<div className='flex flex-row items-center pl-2 pr-4'>
												<div className='flex w-6 justify-center'>
													<Image
														src={`/images/tokens/${basket.icon}`}
														width={32}
														height={32}
														alt={basket.symbol}
														className='block h-6 w-6 align-middle'
													/>
												</div>
											</div>
										}
									/>
								</>
							)}
						</div>
					</div>
				</Modal.Body>
				<Modal.Actions>
					<Button fullWidth disabled={isButtonDisabled} onClick={handleOperation}>
						{pendingTx ? (
							typeof pendingTx === 'string' ? (
								<Link href={`${Config.defaultRpc.blockExplorerUrls[0]}/tx/${pendingTx}`} target='_blank'>
									<a>
										Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
									</a>
								</Link>
							) : (
								'Pending Transaction'
							)
						) : operation === 'MINT' &&
						  mintOption === MintOption.DAI &&
						  daiAllowance &&
						  (daiAllowance.eq(0) || daiAllowance.lt(exponentiate(value))) ? (
							'Approve DAI'
						) : !value ? (
							'Enter a Value'
						) : isButtonDisabled ? (
							'Invalid Input'
						) : operation === 'MINT' ? (
							`Mint ${getDisplayBalance(secondaryValue, 0) || 0} ${basket.symbol}`
						) : (
							`Redeem ${getDisplayBalance(value, 0) || 0} ${basket.symbol}`
						)}
					</Button>
				</Modal.Actions>
			</Modal>
		</>
	) : (
		<></>
	)
}

export default BasketModal
