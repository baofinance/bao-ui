import React, { useEffect, useMemo, useState } from 'react'
import useBao from '../../../../hooks/base/useBao'
import useTokenBalance from '../../../../hooks/base/useTokenBalance'
import { Badge, Col, Modal, Row } from 'react-bootstrap'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '../../../../components/Button'
import { BalanceWrapper } from '../../../../components/Balance'
import { LabelEnd, LabelStart } from '../../../../components/Label'
import { BalanceInput } from '../../../../components/Input'
import { ActiveSupportedBasket } from '../../../../bao/lib/types'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import {
	decimate,
	exponentiate,
	getDisplayBalance,
} from '../../../../utils/numberFormat'
import useTransactionHandler from '../../../../hooks/base/useTransactionHandler'
import useBasketRates from '../../../../hooks/baskets/useNestRate'
import { StyledBadge } from '../../../../components/Badge'

type ModalProps = {
	basket: ActiveSupportedBasket
	operation: string
	show: boolean
	hideModal: () => void
}

const BasketModal: React.FC<ModalProps> = ({
	basket,
	operation,
	show,
	hideModal,
}) => {
	const [value, setValue] = useState<string | undefined>()
	const [secondaryValue, setSecondaryValue] = useState<string | undefined>()
	const [ethBalance, setEthBalance] = useState<BigNumber | undefined>()

	const bao = useBao()
	const { handleTx } = useTransactionHandler()
	const { account } = useWeb3React()
	const basketBalance = useTokenBalance(basket && basket.address)
	const rates = useBasketRates(basket)

	useEffect(() => {
		if (!(bao && account)) return

		bao.web3.eth
			.getBalance(account)
			.then((balance) => setEthBalance(decimate(balance)))
	}, [bao, account])

	const handleMaxClick = () => {
		switch (operation) {
			case 'MINT':
				setValue(ethBalance.toString())
				break
			case 'REDEEM':
				setValue(basketBalance.toString())
				break
			default:
				break
		}
	}

	const handleOperation = () => {
		let tx
		switch (operation) {
			case 'MINT':
				tx = bao
					.getContract('recipe')
					.methods.toPie(
						basket.address,
						exponentiate(secondaryValue).toFixed(0),
						rates.dexIndexes,
					)
					.send({
						from: account,
						value: exponentiate(value).toFixed(0),
					})

				handleTx(
					tx,
					`Mint ${getDisplayBalance(
						new BigNumber(value).div(rates.eth),
						-18,
					)} ${basket.symbol}`,
				)
				break
			case 'REDEEM':
				tx = basket.basketContract.methods.exitPool(value).send({
					from: account,
				})

				handleTx(
					tx,
					`Redeem ${getDisplayBalance(new BigNumber(value), 0)} ${
						basket.symbol
					}`,
				)
		}
	}

	const isDisabled = useMemo(
		() =>
			!value ||
			!value.match(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/) ||
			new BigNumber(value).lte(0) ||
			new BigNumber(value).gt(
				operation === 'MINT' ? ethBalance : basketBalance,
			),
		[value],
	)

	const hide = () => {
		hideModal()
		setValue(undefined)
		setSecondaryValue(undefined)
	}

	return basket ? (
		<>
			<Modal
				show={show}
				onHide={hide}
				centered
			>
				<CloseButton onClick={hide}>
					<FontAwesomeIcon icon="times" />
				</CloseButton>
				<Modal.Header>
					<Modal.Title id="contained-modal-title-vcenter">
						<HeaderWrapper>
							<p>
								{operation === 'MINT' ? 'Mint' : 'Redeem'} {basket.symbol}
							</p>
							<img src={basket.icon} />
						</HeaderWrapper>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{operation === 'MINT' && (
						<>
							<div style={{ display: 'flex' }}>
								<StyledBadge style={{ margin: 'auto' }}>
									1 {basket.symbol} ={' '}
									<FontAwesomeIcon icon={['fab', 'ethereum']} />{' '}
									{rates && getDisplayBalance(rates.eth)}
								</StyledBadge>
							</div>
							<br />
							<div style={{ textAlign: 'center' }}>
								<b style={{ fontWeight: 'bold' }}>NOTE:</b> An extra 5% of the
								ETH cost will be included to account for slippage. Any unused
								ETH will be returned in the mint transaction.
							</div>
						</>
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
												? `${ethBalance && ethBalance.toFixed(4)} ETH`
												: `${basketBalance.toFixed(4)} ${basket.symbol}`}
										</AssetLabel>
									</LabelStack>
								</LabelEnd>
							</Col>
						</BalanceWrapper>
						<Row>
							<Col xs={12}>
								<BalanceInput
									value={value}
									onChange={(e) => setValue(e.currentTarget.value)}
									onMaxClick={handleMaxClick}
									disabled={operation === 'MINT'}
									label={
										<AssetStack>
											<IconFlex>
												{operation === 'MINT' ? (
													<FontAwesomeIcon icon={['fab', 'ethereum']} />
												) : (
													<img src={basket.icon} />
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
											onChange={(e) => {
												const ethVal = decimate(rates.eth)
													.times(e.currentTarget.value)
													.times(1.05)
												setSecondaryValue(e.currentTarget.value)
												setValue(
													ethVal.isFinite() ? ethVal.toString() : '0', // Pad an extra 5% ETH. It will be returned to the user if it is not used.
												)
											}}
											onMaxClick={() => {
												// Seek to mint 95% of total ETH value (use remaining 5% as slippage protection)

												const ethVal = ethBalance.times(0.95)
												setSecondaryValue(ethVal.div(decimate(rates.eth)).toFixed(8))
												setValue(ethBalance.toString())
											}}
											label={
												<AssetStack>
													<IconFlex>
														<img src={basket.icon} />
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
					<Button disabled={isDisabled} onClick={handleOperation}>
						{!value
							? 'Enter a Value'
							: isDisabled
							? 'Invalid Input'
							: operation === 'MINT'
							? `Mint ${getDisplayBalance(secondaryValue, 0) || 0} ${basket.symbol}`
							: `Redeem ${getDisplayBalance(value, 0) || 0} ${basket.symbol}`}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	) : (
		<></>
	)
}

export default BasketModal
