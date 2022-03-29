import React, { useCallback, useState } from 'react'
import { ActiveSupportedMarket } from 'bao/lib/types'
import { NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import { Col, Modal, ModalProps, Row } from 'react-bootstrap'
import {
	useAccountBalances,
	useBorrowBalances,
	useSupplyBalances,
} from 'hooks/markets/useBalances'
import { useAccountLiquidity } from 'hooks/markets/useAccountLiquidity'
import { useExchangeRates } from 'hooks/markets/useExchangeRates'
import useBao from 'hooks/base/useBao'
import BigNumber from 'bignumber.js'
import { MarketButton } from './MarketButton'
import { MarketStats } from './Stats'
import { decimate, exponentiate } from 'utils/numberFormat'
import {
	HeaderWrapper,
	ModalStack,
	InputStack,
	LabelFlex,
	LabelStack,
	MaxLabel,
	AssetLabel,
	AssetStack,
	IconFlex,
	CloseButton,
} from './styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMarketPrices } from 'hooks/markets/usePrices'
import styled from 'styled-components'

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	mint = 'Mint',
	repay = 'Repay',
}

type MarketModalProps = ModalProps & {
	asset: ActiveSupportedMarket
	show: boolean
	onHide: () => void
}

const MarketModal = ({
	operations,
	asset,
	show,
	onHide,
}: MarketModalProps & { operations: MarketOperations[] }) => {
	const [operation, setOperation] = useState(operations[0])
	const [val, setVal] = useState<string>('')
	const bao = useBao()
	const balances = useAccountBalances()
	const borrowBalances = useBorrowBalances()
	const supplyBalances = useSupplyBalances()
	const accountLiquidity = useAccountLiquidity()
	const { exchangeRates } = useExchangeRates()
	const { prices } = useMarketPrices()

	const max = () => {
		switch (operation) {
			case MarketOperations.supply:
				return balances
					? balances.find(
							(_balance) =>
								_balance.address.toLowerCase() ===
								asset.underlyingAddress.toLowerCase(),
					  ).balance
					: 0
			case MarketOperations.withdraw:
				const supply =
					supplyBalances && exchangeRates
						? supplyBalances.find(
								(_balance) =>
									_balance.address.toLowerCase() ===
									asset.marketAddress.toLowerCase(),
						  ).balance *
						  decimate(exchangeRates[asset.marketAddress]).toNumber()
						: 0
				const withdrawable = accountLiquidity
					? accountLiquidity.usdBorrowable /
					  (asset.collateralFactor * asset.price)
					: 0
				return !(accountLiquidity && accountLiquidity.usdBorrowable) ||
					withdrawable > supply
					? supply
					: withdrawable
			case MarketOperations.mint:
				return prices && accountLiquidity
					? accountLiquidity.usdBorrowable / asset.price
					: 0
			case MarketOperations.repay:
				if (borrowBalances && balances) {
					const borrowBalance = borrowBalances.find(
						(_balance) =>
							_balance.address.toLowerCase() ===
							asset.marketAddress.toLowerCase(),
					).balance
					const walletBalance = balances.find(
						(_balance) =>
							_balance.address.toLowerCase() ===
							asset.underlyingAddress.toLowerCase(),
					).balance
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
				<CloseButton onClick={onHide}>
					<FontAwesomeIcon icon="times" />
				</CloseButton>
				<Modal.Header>
					<Modal.Title id="contained-modal-title-vcenter">
						<HeaderWrapper>
							<p>{operation}</p>
							<img src={asset.icon} />
						</HeaderWrapper>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ModalStack>
						<NavButtons
							options={operations}
							active={operation}
							onClick={setOperation}
						/>
						<BalanceWrapper>
							<Col xs={4}>
								<LabelStart></LabelStart>
							</Col>
							<Col xs={8}>
								<LabelEnd>
									<LabelStack>
										<MaxLabel>{`${maxLabel()}:`}</MaxLabel>
										<AssetLabel>
											{`${max().toFixed(4)} ${asset.underlyingSymbol}`}
										</AssetLabel>
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
										setVal(
											(
												Math.floor(max() * 10 ** asset.underlyingDecimals) /
												10 ** asset.underlyingDecimals
											).toString(),
										)
									}
									label={
										<AssetStack>
											<IconFlex>
												<img src={asset.icon} />
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
						val={
							val && !isNaN(val as any)
								? exponentiate(val, asset.underlyingDecimals)
								: new BigNumber(0)
						}
						isDisabled={
							!val || !bao || isNaN(val as any) || parseFloat(val) > max()
						}
					/>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export const MarketSupplyModal = ({
	show,
	onHide,
	asset,
}: MarketModalProps) => (
	<MarketModal
		operations={[MarketOperations.supply, MarketOperations.withdraw]}
		asset={asset}
		show={show}
		onHide={onHide}
	/>
)

export const MarketBorrowModal = ({
	show,
	onHide,
	asset,
}: MarketModalProps) => (
	<MarketModal
		operations={[MarketOperations.mint, MarketOperations.repay]}
		asset={asset}
		show={show}
		onHide={onHide}
	/>
)

export const LabelEnd = styled.div`
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	width: 100%;

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		font-size: 0.75rem !important;
	}
`

export const LabelStart = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: flex-start;
	width: 100%;

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		font-size: 0.75rem !important;
	}
`

export const FeeLabel = styled.p`
	color: ${(props) => props.theme.color.text[200]};
	font-size: 0.875rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
	margin-bottom: 0px;

	@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
		font-size: 0.75rem;
	}
`

const BalanceWrapper = styled(Row)`
	padding: 0.25rem;
`

export const QuestionIcon = styled(FontAwesomeIcon)`
	color: ${(props) => props.theme.color.text[200]};

	&:hover,
	&:focus {
		color: ${(props) => props.theme.color.text[100]};
		animation: 200ms;
		cursor: pointer;
	}
`
