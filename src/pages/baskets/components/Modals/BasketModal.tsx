import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { Icon } from '@/components/Icon'
import Input from '@/components/Input'
import { PendingTransaction } from '@/components/Loader/Loader'
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
import { faExternalLink, faExternalLinkAlt, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
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
	const [val, setVal] = useState<string | undefined>('')
	const [secondaryVal, setSecondaryVal] = useState<string | undefined>('')
	const [mintOption, setMintOption] = useState<MintOption>(basket.symbol === 'bstbl' ? MintOption.DAI : MintOption.ETH)

	const { handleTx, pendingTx, txHash } = useTransactionHandler()
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
					if (daiAllowance.eq(0) || daiAllowance.lt(parseUnits(val))) {
						// TODO: give the user a notice that we're approving max uint and instruct them how to change this val.
						tx = dai.approve(recipe.address, ethers.constants.MaxUint256)
						handleTx(tx, 'Baskets Recipe: Approve DAI')
						break
					}

					tx = recipe.bake(basket.address, parseUnits(val), parseUnits(secondaryVal))
				} else {
					// Else, use ETH to mint
					tx = recipe.toBasket(basket.address, parseUnits(secondaryVal), {
						value: parseUnits(val),
					})
				}

				handleTx(tx, `${basket.symbol} Basket: Mint ${getDisplayBalance(secondaryVal, 0) || 0} ${basket.symbol}`, () => hide())
				break
			case 'REDEEM':
				tx = basket.basketContract.exitPool(parseUnits(val))
				handleTx(tx, `${basket.symbol} Basket: Redeem ${getDisplayBalance(val, 0)} ${basket.symbol}`, () => hide())
		}
	}

	const isButtonDisabled = useMemo(() => {
		if (pendingTx !== false) {
			return true
		}
		if (operation === 'MINT') {
			const _val = val && parseUnits(val)
			const daiOrEth = mintOption === MintOption.DAI ? daiBalance : ethBalance
			const walletBallance = operation === 'MINT' ? daiOrEth : basketBalance
			let canParseVal = true
			try {
				parseUnits(val)
			} catch {
				canParseVal = false
			}
			return (
				mintOption === MintOption.DAI &&
				daiAllowance &&
				(daiAllowance.eq(0) || daiAllowance.lt(_val)) &&
				canParseVal &&
				(parseUnits(val).eq(0) || parseUnits(val).gt(walletBallance))
			)
		}
		return false
	}, [pendingTx, operation, mintOption, daiAllowance, val, daiBalance, ethBalance, basketBalance])

	const hide = () => {
		hideModal()
		setVal('')
		setSecondaryVal('')
	}

	return basket ? (
		<>
			<Modal isOpen={show} onDismiss={hide}>
				<Modal.Header
					header={
						<div className='mx-0 my-auto flex h-full items-center gap-2 text-baoWhite'>
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
										{' = $'}
										{rates && getDisplayBalance(rates.dai)}
									</Badge>
								</div>
								<div className='mt-4 flex gap-2 rounded-3xl bg-baoWhite/5 p-4'>
									<Icon icon='warning' className='m-0 h-6 w-6 flex-none' />
									<Typography variant='sm' className='m-0 pr-1'>
										There will be an extra 2% of the cost included to account for slippage. Any unused tokens will be returned as part of
										the mint transaction.
									</Typography>
								</div>
							</>
						) : (
							<div className='rounded-3xl bg-baoWhite/5 p-4'>
								<div className='mt-4 flex gap-2'>
									<Icon icon='warning' className='m-0 h-6 w-6 flex-none' />
									<Typography variant='sm' className='m-0 pr-1'>
										When you redeem {basket.name}, you will receive the underlying tokens. Alternatively, you can swap {basket.name}{' '}
										<a href={`${swapLink}`} target='blank' className='font-bold hover:text-baoRed'>
											here <FontAwesomeIcon size='xs' icon={faExternalLinkAlt} />
										</a>
										.
									</Typography>
								</div>
								<div className='m-auto px-2 pt-2 text-center'>
									<Badge>Slippage may occur on swaps!</Badge>
								</div>
							</div>
						)}
					</div>
					<div className='flex w-full flex-col'>
						<div className='flex h-full flex-col items-center justify-center'>
							<div className='flex w-full flex-row'>
								<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='font-semibold text-baoRed'>
										Balance:
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
								value={val}
								onChange={e => setVal(e.currentTarget.value)}
								onSelectMax={() => setVal(formatUnits(basketBalance, 18))}
								disabled={operation === 'MINT'}
								label={
									<div className='flex flex-row items-center rounded-r-3xl bg-baoBlack'>
										{operation === 'MINT' && basket.symbol.toLowerCase() === 'bstbl' && (
											<>
												<Tooltipped content={`Swap input currency to ${mintOption === MintOption.DAI ? 'ETH' : 'DAI'}`}>
													<Button
														size='xs'
														onClick={() => {
															// Clear input vals
															setVal('')
															setSecondaryVal('')
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
										<div className='flex flex-row items-center rounded-r-3xl bg-baoBlack pl-2 pr-4'>
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
										value={secondaryVal}
										onChange={e => {
											try {
												parseUnits(e.currentTarget.value)
											} catch {
												setVal('')
												setSecondaryVal('')
												return
											}
											// Seek to mint 98% of total val (use remaining 2% as slippage protection)
											const inputVal = decimate(
												BigNumber.from(mintOption === MintOption.DAI ? rates.dai : rates.eth).mul(parseUnits(e.currentTarget.value)),
											).mul(parseUnits('1.02'))
											setSecondaryVal(e.currentTarget.value)
											setVal(formatUnits(decimate(inputVal)))
										}}
										onSelectMax={() => {
											// Seek to mint 98% of total val (use remaining 2% as slippage protection)
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

											// Seek to mint 98% of total val (use remaining 2% as slippage protection)
											const maxVal = usedBal.mul(parseUnits('0.98')).div(usedRate)
											setSecondaryVal(formatUnits(maxVal))
											setVal(formatUnits(usedBal))
										}}
										label={
											<div className='flex flex-row items-center rounded-r-3xl bg-baoBlack pl-2 pr-4'>
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
					{pendingTx ? (
						<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
							<Button fullWidth className='!rounded-full'>
								<PendingTransaction /> Pending Transaction
								<FontAwesomeIcon icon={faExternalLink} className='ml-2 text-baoRed' />
							</Button>
						</a>
					) : (
						<Button
							fullWidth
							disabled={isButtonDisabled || (mintOption === MintOption.DAI && daiBalance.lte(0)) || val === '0'}
							onClick={handleOperation}
						>
							{operation === 'MINT' &&
							mintOption === MintOption.DAI &&
							daiAllowance &&
							(daiAllowance.eq(0) || daiAllowance.lt(parseUnits(val)))
								? 'Approve DAI'
								: !val
								? 'Enter a Value'
								: isButtonDisabled
								? 'Invalid Input'
								: operation === 'MINT'
								? `Mint ${(secondaryVal && getDisplayBalance(secondaryVal, 0)) || 0} ${basket.symbol}`
								: `Redeem ${(val && getDisplayBalance(val, 0)) || 0} ${basket.symbol}`}
						</Button>
					)}
				</Modal.Actions>
			</Modal>
		</>
	) : (
		<></>
	)
}

export default BasketModal
