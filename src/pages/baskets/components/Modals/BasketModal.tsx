import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useContract from '@/hooks/base/useContract'
import useTokenBalance, { useEthBalance } from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import type { Dai, SimpleUniRecipe } from '@/typechain/index'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faExternalLinkAlt, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
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
	const [value, setValue] = useState<string | undefined>('0')
	const [secondaryValue, setSecondaryValue] = useState<string | undefined>('0')
	const [mintOption, setMintOption] = useState<MintOption>(basket.symbol === 'bstbl' ? MintOption.DAI : MintOption.ETH)

	const { handleTx, pendingTx } = useTransactionHandler()
	const rates = useBasketRates(basket)

	const recipe = useContract<SimpleUniRecipe>('SimpleUniRecipe', basket.recipeAddress)
	const dai = useContract<Dai>('Dai')

	// Get DAI approval
	const daiAllowance = useAllowance(Config.addressMap.DAI, basket.recipeAddress)

	// Get Basket & DAI balances
	const basketBalance = useTokenBalance(basket.address)
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const ethBalance = useEthBalance()

	const swapLink = basket && basket.swap

	const handleOperation = () => {
		let tx

		switch (operation) {
			case 'MINT':
				if (mintOption === MintOption.DAI) {
					// If DAI allowance is zero or insufficient, send an Approval TX
					if (daiAllowance.eq(0) || daiAllowance.lt(parseUnits(value))) {
						// TODO: give the user a notice that we're approving max uint and instruct them how to change this value.
						tx = dai.approve(recipe.address, ethers.constants.MaxUint256)
						handleTx(tx, 'Baskets Recipe: Approve DAI')
						break
					}

					tx = recipe.bake(basket.address, parseUnits(value), parseUnits(secondaryValue))
				} else {
					// Else, use ETH to mint
					tx = recipe.toBasket(basket.address, parseUnits(secondaryValue), {
						value: parseUnits(value),
					})
				}

				handleTx(tx, `${basket.symbol} Basket: Mint ${getDisplayBalance(secondaryValue, 0) || 0} ${basket.symbol}`, () => hide())
				break
			case 'REDEEM':
				tx = basket.basketContract.exitPool(parseUnits(value))
				handleTx(tx, `${basket.symbol} Basket: Redeem ${getDisplayBalance(value, 0)} ${basket.symbol}`, () => hide())
		}
	}

	const isButtonDisabled = useMemo(() => {
		if (pendingTx !== false) {
			return true
		}
		if (operation === 'MINT') {
			const daiOrEth = mintOption === MintOption.DAI ? daiBalance : ethBalance
			const walletBallance = operation === 'MINT' ? daiOrEth : basketBalance
			let canParseValue = true
			try {
				parseUnits(value)
			} catch {
				canParseValue = false
			}
			console.log('daiAllowance', daiAllowance)
			return (
				mintOption === MintOption.DAI &&
				daiAllowance &&
				(daiAllowance.eq(0) || daiAllowance.lt(parseUnits(value))) &&
				canParseValue &&
				(parseUnits(value).eq(0) || parseUnits(value).gt(walletBallance))
			)
		}
		return false
	}, [pendingTx, operation, mintOption, daiAllowance, value, daiBalance, ethBalance, basketBalance])

	const hide = () => {
		hideModal()
		setValue('0')
		setSecondaryValue('0')
	}

	return basket ? (
		<>
			<Modal isOpen={show} onDismiss={hide}>
				<Modal.Header
					header={
						<div className='mx-0 my-auto flex h-full items-center gap-2 text-text-100'>
							{operation === 'MINT' ? 'Mint' : 'Redeem'} {basket.symbol}
							<Image src={`/images/tokens/${basket.icon}`} width={32} height={32} alt={basket.symbol} />
						</div>
					}
					onClose={hide}
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
												? `${daiBalance && getDisplayBalance(daiBalance)} DAI`
												: `${ethBalance && getDisplayBalance(ethBalance)} ETH`
											: `${basketBalance && getDisplayBalance(basketBalance)} ${basket.symbol}`}
									</Typography>
								</div>
							</div>
							<Input
								value={value}
								onChange={e => setValue(e.currentTarget.value)}
								onSelectMax={() => setValue(formatUnits(basketBalance, 18))}
								disabled={operation === 'MINT'}
								label={
									<div className='flex flex-row items-center'>
										{operation === 'MINT' && basket.symbol.toLowerCase() === 'bstbl' && (
											<>
												<Tooltipped content={`Swap input currency to ${mintOption === MintOption.DAI ? 'ETH' : 'DAI'}`}>
													<Button
														size='xs'
														onClick={() => {
															// Clear input values
															setValue('0')
															setSecondaryValue('0')
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
											try {
												parseUnits(e.currentTarget.value)
											} catch {
												setValue('0')
												setSecondaryValue('0')
												return
											}
											// Seek to mint 98% of total value (use remaining 2% as slippage protection)
											const inputVal = decimate(
												BigNumber.from(mintOption === MintOption.DAI ? rates.dai : rates.eth).mul(parseUnits(e.currentTarget.value)),
											).mul(parseUnits('1.02'))
											setSecondaryValue(e.currentTarget.value)
											setValue(formatUnits(decimate(inputVal)))
										}}
										onSelectMax={() => {
											// Seek to mint 98% of total value (use remaining 2% as slippage protection)
											let usedBal
											let usedRate
											switch (mintOption) {
												case MintOption.DAI:
													usedBal = daiBalance
													usedRate = rates.dai
													break
												case MintOption.ETH:
													usedBal = ethBalance
													usedRate = rates.eth
													break
											}

											// Seek to mint 98% of total value (use remaining 2% as slippage protection)
											const maxVal = usedBal.mul(parseUnits('0.98')).div(usedRate)
											setSecondaryValue(formatUnits(maxVal))
											setValue(formatUnits(usedBal))
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
					<Button
						fullWidth
						disabled={isButtonDisabled || (mintOption === MintOption.DAI && daiBalance.lte(0)) || value === '0'}
						onClick={handleOperation}
					>
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
						  (daiAllowance.eq(0) || daiAllowance.lt(parseUnits(value))) ? (
							'Approve DAI'
						) : !value ? (
							'Enter a Value'
						) : isButtonDisabled ? (
							'Invalid Input'
						) : operation === 'MINT' ? (
							`Mint ${(secondaryValue && getDisplayBalance(secondaryValue, 0)) || 0} ${basket.symbol}`
						) : (
							`Redeem ${(value && getDisplayBalance(value, 0)) || 0} ${basket.symbol}`
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
