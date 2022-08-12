import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faExternalLinkAlt, faSync, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { ethers } from 'ethers'
import React, { useMemo, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import Config from '../../../../bao/lib/config'
import { ActiveSupportedBasket } from '../../../../bao/lib/types'
import { StyledBadge } from '../../../../components/Badge'
import { BalanceWrapper } from '../../../../components/Balance'
import { Button, MaxButton } from '../../../../components/Button'
import { BalanceInput } from '../../../../components/Input'
import { LabelEnd, LabelStart } from '../../../../components/Label'
import { ExternalLink } from '../../../../components/Link'
import Tooltipped from '../../../../components/Tooltipped'
import useAllowancev2 from '../../../../hooks/base/useAllowancev2'
import useBao from '../../../../hooks/base/useBao'
import useTokenBalance from '../../../../hooks/base/useTokenBalance'
import useTransactionHandler from '../../../../hooks/base/useTransactionHandler'
import useBasketRates from '../../../../hooks/baskets/useNestRate'
import { decimate, exponentiate, getDisplayBalance } from '../../../../utils/numberFormat'
import {
	AssetLabel,
	AssetStack,
	CloseButton,
	HeaderWrapper,
	IconFlex,
	LabelStack,
	MaxLabel,
	ModalStack,
} from '../../../Markets/components/styles'

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
	const daiAllowance = useAllowancev2(Config.addressMap.DAI, bao && bao.getContract('recipe').options.address)

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
						tx = bao
							.getNewContract('erc20.json', Config.addressMap.DAI)
							.methods.approve(
								recipe.options.address,
								ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
							)
							.send({ from: account })

						handleTx(tx, 'Approve DAI for Baskets Recipe')
						break
					}

					tx = recipe.methods.bake(basket.address, exponentiate(value).toFixed(0), exponentiate(secondaryValue).toFixed(0)).send({
						from: account,
					})
				} else {
					// Else, use ETH to mint
					tx = recipe.methods.toBasket(basket.address, exponentiate(secondaryValue).toFixed(0)).send({
						from: account,
						value: exponentiate(value).toFixed(0),
					})
				}

				handleTx(tx, `Mint ${getDisplayBalance(secondaryValue, 0) || 0} ${basket.symbol}`, () => hide())
				break
			case 'REDEEM':
				tx = basket.basketContract.methods.exitPool(exponentiate(value).toFixed(0)).send({
					from: account,
				})

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
		[value, daiAllowance, operation, mintOption, pendingTx],
	)

	const hide = () => {
		hideModal()
		setValue(undefined)
		setSecondaryValue(undefined)
	}

	return basket ? (
		<>
			<Modal show={show} onHide={hide} centered>
				<CloseButton onClick={hide}>
					<FontAwesomeIcon icon={faTimes} />
				</CloseButton>
				<Modal.Header>
					<Modal.Title id='contained-modal-title-vcenter'>
						<HeaderWrapper>
							<p>
								{operation === 'MINT' ? 'Mint' : 'Redeem'} {basket.symbol}
							</p>
							<img src={require(`assets/img/tokens/${basket.symbol}.png`).default} />
						</HeaderWrapper>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{operation === 'MINT' ? (
						<>
							<div style={{ display: 'flex' }}>
								<StyledBadge style={{ margin: 'auto' }}>
									1 {basket.symbol} = <FontAwesomeIcon icon={faEthereum} /> {rates && getDisplayBalance(rates.eth)}
									{' = '}
									{rates && getDisplayBalance(rates.dai)} DAI
								</StyledBadge>
							</div>
							<br />
							<div style={{ textAlign: 'center' }}>
								<b style={{ fontWeight: 'bold' }}>NOTE:</b> An extra 2% of the mint cost will be included to account for slippage. Any
								unused input tokens will be returned in the mint transaction.
							</div>
						</>
					) : (
						<div style={{ textAlign: 'center' }}>
							<b style={{ fontWeight: 'bold' }}>NOTE:</b> When you redeem {basket.name}, you will receive the underlying tokens. Otherwise,
							you can swap {basket.name}{' '}
							<a href={`${swapLink}`} target='blank' style={{ fontWeight: 700 }}>
								here
							</a>
							. (<b style={{ fontWeight: 'bold' }}>CAUTION:</b> Slippage may apply on swaps)
						</div>
					)}
					<ModalStack>
						<BalanceWrapper>
							<Col xs={4}>
								<LabelStart />
							</Col>
							<Col xs={8}>
								<LabelEnd>
									<LabelStack>
										<MaxLabel>{`Available:`}</MaxLabel>
										<AssetLabel>
											{operation === 'MINT'
												? mintOption === MintOption.DAI
													? `${daiBalance && decimate(daiBalance).toFixed(4)} DAI`
													: `${ethBalance && decimate(ethBalance).toFixed(4)} ETH`
												: `${basketBalance && decimate(basketBalance).toFixed(4)} ${basket.symbol}`}
										</AssetLabel>
									</LabelStack>
								</LabelEnd>
							</Col>
						</BalanceWrapper>
						<Row>
							<Col xs={12}>
								<BalanceInput
									value={value}
									onChange={e => setValue(e.currentTarget.value)}
									onMaxClick={() => setValue(decimate(basketBalance).toFixed(18))}
									disabled={operation === 'MINT'}
									label={
										<AssetStack>
											{operation === 'MINT' && (
												<>
													<Tooltipped content={`Swap input currency to ${mintOption === MintOption.DAI ? 'ETH' : 'DAI'}`}>
														<MaxButton
															onClick={() => {
																// Clear input values
																setValue('')
																setSecondaryValue('')
																// Swap mint option
																setMintOption(mintOption === MintOption.DAI ? MintOption.ETH : MintOption.DAI)
															}}
														>
															<FontAwesomeIcon icon={faSync} />
														</MaxButton>
													</Tooltipped>
												</>
											)}
											<IconFlex>
												{operation === 'MINT' ? (
													<img src={require(`assets/img/tokens/${mintOption === MintOption.DAI ? 'DAI' : 'ETH'}.png`).default} />
												) : (
													<img src={require(`assets/img/tokens/${basket.symbol}.png`).default} />
												)}
											</IconFlex>
										</AssetStack>
									}
								/>
								{operation === 'MINT' && rates && (
									<>
										<br />
										<BalanceInput
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
											onMaxClick={() => {
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
												<AssetStack>
													<IconFlex>
														<img src={require(`assets/img/tokens/${basket.symbol}.png`).default} />
													</IconFlex>
												</AssetStack>
											}
										/>
									</>
								)}
							</Col>
						</Row>
					</ModalStack>
				</Modal.Body>
				<Modal.Footer>
					<Button disabled={isButtonDisabled} onClick={handleOperation}>
						{pendingTx ? (
							typeof pendingTx === 'string' ? (
								<ExternalLink href={`${Config.defaultRpc.blockExplorerUrls[0]}/tx/${pendingTx}`} target='_blank'>
									Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
								</ExternalLink>
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
				</Modal.Footer>
			</Modal>
		</>
	) : (
		<></>
	)
}

export default BasketModal
