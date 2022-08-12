import { ActiveSupportedMarket } from 'bao/lib/types'
import BigNumber from 'bignumber.js'
import { BalanceWrapper } from 'components/Balance'
import { CloseButton, NavButtons } from 'components/Button'
import { IconFlex } from 'components/Icon'
import { BalanceInput } from 'components/Input'
import { AssetLabel, LabelEnd, LabelStack, LabelStart, MaxLabel } from 'components/Label'
import useBao from 'hooks/base/useBao'
import { useAccountLiquidity } from 'hooks/markets/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from 'hooks/markets/useBalances'
import { useExchangeRates } from 'hooks/markets/useExchangeRates'
import { useMarketPrices } from 'hooks/markets/usePrices'
import React, { useCallback, useState } from 'react'
import { Col, Modal, ModalProps, Row } from 'react-bootstrap'
import { decimate, exponentiate } from 'utils/numberFormat'
import { MarketButton } from '../MarketButton'
import { MarketStats } from '../Stats'
import { AssetStack, HeaderWrapper, ModalStack } from '../styles'

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	mint = 'Mint',
	repay = 'Repay',
}

export type MarketModalProps = ModalProps & {
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
			<Modal show={show} onHide={hideModal} centered>
				<CloseButton onHide={hideModal} onClick={onHide} />
				<Modal.Header>
					<Modal.Title id='contained-modal-title-vcenter'>
						<HeaderWrapper>
							<p>{operation}</p>
							<img src={require(`assets/img/tokens/${asset.underlyingSymbol}.png`).default} />
						</HeaderWrapper>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<NavButtons options={operations} active={operation} onClick={setOperation} />
					<ModalStack>
						<BalanceWrapper>
							<Col xs={4}>
								<LabelStart></LabelStart>
							</Col>
							<Col xs={8}>
								<LabelEnd>
									<LabelStack>
										<MaxLabel>{`${maxLabel()}:`}</MaxLabel>
										<AssetLabel>{`${max().toFixed(4)} ${asset.underlyingSymbol}`}</AssetLabel>
									</LabelStack>
								</LabelEnd>
							</Col>
						</BalanceWrapper>
						<Row>
							<Col xs={12}>
								<BalanceInput
									value={val}
									onChange={handleChange}
									onMaxClick={() =>
										setVal((Math.floor(max() * 10 ** asset.underlyingDecimals) / 10 ** asset.underlyingDecimals).toString())
									}
									label={
										<AssetStack>
											<IconFlex>
												<img src={require(`assets/img/tokens/${asset.underlyingSymbol}.png`).default} />
											</IconFlex>
										</AssetStack>
									}
								/>
							</Col>
						</Row>
						<MarketStats operation={operation} asset={asset} amount={val} />
					</ModalStack>
				</Modal.Body>
				<Modal.Footer>
					<MarketButton
						operation={operation}
						asset={asset}
						val={val && !isNaN(val as any as number) ? exponentiate(val, asset.underlyingDecimals) : new BigNumber(0)}
						isDisabled={!val || !bao || isNaN(val as any as number) || parseFloat(val) > max()}
						onHide={hideModal}
					/>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default MarketModal
