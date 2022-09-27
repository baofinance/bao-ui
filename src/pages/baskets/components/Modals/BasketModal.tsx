import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useBasketRates from '@/hooks/baskets/useBasketRate'
import { decimate, exponentiate, getDisplayBalance } from '@/utils/numberFormat'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faExternalLinkAlt, faSync } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { ethers, BigNumber } from 'ethers'
import BN from 'bignumber.js'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { SimpleUniRecipe__factory } from '@/typechain/factories'
import { Dai__factory } from '@/typechain/factories'

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
	const [mintOption, setMintOption] = useState<MintOption>(MintOption.DAI)

	const { library, chainId } = useWeb3React()
	const { handleTx, pendingTx } = useTransactionHandler()
	const rates = useBasketRates(basket)

	// Get DAI approval
	const daiAllowance = useAllowance(Config.addressMap.DAI, Config.addressMap.dai)

	// Get Basket & DAI balances
	const basketBalance = useTokenBalance(basket && basket.address)
	const daiBalance = useTokenBalance(Config.addressMap.DAI)
	const ethBalance = useTokenBalance('ETH')

	const swapLink = basket && basket.swap

	const handleOperation = () => {
		let tx

		const signer = library.getSigner()
		const recipeAddr = Config.contracts.recipe[chainId].address
		const recipe = SimpleUniRecipe__factory.connect(recipeAddr, signer)

		switch (operation) {
			case 'MINT':
				if (mintOption === MintOption.DAI) {
					// If DAI allowance is zero or insufficient, send an Approval TX
					if (daiAllowance.eq(0) || daiAllowance.lt(BigNumber.from(exponentiate(value)))) {
						const dai = Dai__factory.connect(Config.addressMap.DAI, library.getSigner())
						// TODO: give the user a notice that we're approving max uint and instruct them how to change this value.
						tx = dai.approve(recipe.address, ethers.constants.MaxUint256)
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
				handleTx(tx, `Redeem ${getDisplayBalance(value, 0)} ${basket.symbol}`, () => hide())
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
					(daiAllowance.eq(0) || daiAllowance.lt(BigNumber.from(exponentiate(value))))
				)
			) &&
				// Else, check that the input value is valid.
				(!value ||
					!value.match(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/) ||
					ethers.utils.parseEther(value).lte(0) ||
					ethers.utils
						.parseEther(value)
						.gt(operation === 'MINT' ? (mintOption === MintOption.DAI ? daiBalance : ethBalance) : basketBalance),
				)),
		[pendingTx, operation, mintOption, daiAllowance, value, daiBalance, ethBalance, basketBalance],
	)

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
												? `${daiBalance && decimate(daiBalance)} DAI`
												: `${ethBalance && decimate(ethBalance)} ETH`
											: `${basketBalance && decimate(basketBalance)} ${basket.symbol}`}
									</Typography>
								</div>
							</div>
							<Input
								value={value}
								onChange={e => setValue(e.currentTarget.value)}
								onSelectMax={() => setValue(ethers.utils.formatUnits(basketBalance, 18))}
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
											const inputVal = new BN((mintOption === MintOption.DAI ? rates.dai : rates.eth).toString())
												.div(10 ** 18)
												.times(e.currentTarget.value)
												.times(1.02)
											console.log(inputVal)
											setSecondaryValue(e.currentTarget.value)
											setValue(
												// FIXME: ethers.BigNumber does not support an infinite value
												inputVal.isFinite() ? inputVal.toFixed(18) : '0', // Pad an extra 2% ETH. It will be returned to the user if it is not used.
												//ethers.utils.formatUnits(inputVal, 18),
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

											const maxVal = new BN(usedBal.toString()).times(0.98)
											const secVal = new BN(maxVal.toString())
												.div(usedRate.toString())
												.times(10 ** 18)
											setSecondaryValue(secVal.toFixed())
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
						  (daiAllowance.eq(0) || daiAllowance.lt(BigNumber.from(exponentiate(value)))) ? (
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
