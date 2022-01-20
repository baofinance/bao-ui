import React, { useCallback, useState } from 'react'
import { SupportedMarket } from 'bao/lib/types'
import { NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import { Modal, ModalProps } from 'react-bootstrap'
import {
	useAccountBalances, useBorrowBalances,
	useSupplyBalances,
} from 'hooks/hard-synths/useBalances'
import { useAccountLiquidity } from '../../../hooks/hard-synths/useAccountLiquidity'
import { useExchangeRates } from 'hooks/hard-synths/useExchangeRates'
import { useMarketPrices } from 'hooks/hard-synths/usePrices'
import useBao from 'hooks/useBao'
import BigNumber from 'bignumber.js'
import { MarketButton } from './MarketButton'
import { MarketStats } from './Stats'
import { decimate, exponentiate } from '../../../utils/numberFormat'
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
} from './styles'
import { CloseButton } from 'views/Basket/components/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	mint = 'Mint',
	repay = 'Repay',
}

type MarketModalProps = ModalProps & {
	asset: SupportedMarket
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
	const { prices } = useMarketPrices()
	const accountLiquidity = useAccountLiquidity()
	const { exchangeRates } = useExchangeRates()

	const max = () => {
		switch (operation) {
			case MarketOperations.supply:
				return balances
					? balances.find(
							(_balance) =>
								_balance.address.toLowerCase() ===
								asset.underlying.toLowerCase(),
					  ).balance
					: 0
			case MarketOperations.withdraw:
				const supply =
					supplyBalances && exchangeRates
						? supplyBalances.find(
								(_balance) =>
									_balance.address.toLowerCase() === asset.token.toLowerCase(),
						  ).balance * decimate(exchangeRates[asset.token]).toNumber()
						: 0
				const withdrawable =
					prices && accountLiquidity
						? accountLiquidity.usdBorrowable /
						  (asset.collateralFactor *
								decimate(
									prices[asset.token],
									new BigNumber(36).minus(asset.decimals),
								).toNumber())
						: 0
				return !(accountLiquidity && accountLiquidity.usdBorrowable) ||
					withdrawable > supply
					? supply
					: withdrawable
			case MarketOperations.mint:
				return prices && accountLiquidity
					? accountLiquidity.usdBorrowable /
							decimate(
								prices[asset.token],
								new BigNumber(36).minus(asset.decimals),
							).toNumber()
					: 0
			case MarketOperations.repay:
				if (borrowBalances && balances) {
					const borrowBalance = borrowBalances.find(
						(_balance) =>
							_balance.address.toLowerCase() === asset.token.toLowerCase(),
					).balance
					const walletBalance = balances.find(
						(_balance) =>
							_balance.address.toLowerCase() === asset.underlying.toLowerCase(),
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
		<Modal show={show} onHide={hideModal} centered>
			<CloseButton onClick={hideModal}>
				<FontAwesomeIcon icon="window-close" />
			</CloseButton>
			<Modal.Header>
				<Modal.Title id="contained-modal-title-vcenter">
					<HeaderWrapper>
						<img src={asset.icon} />
						<p>{asset.underlyingSymbol}</p>
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
					<InputStack>
						<LabelFlex>
							<LabelStack>
								<MaxLabel>{`${maxLabel()}:`}</MaxLabel>
								<AssetLabel>
									{`${max().toFixed(4)} ${asset.underlyingSymbol}`}
								</AssetLabel>
							</LabelStack>
						</LabelFlex>

						<BalanceInput
							value={val}
							onChange={handleChange}
							onMaxClick={() =>
								setVal(
									(
										Math.floor(max() * 10 ** asset.decimals) /
										10 ** asset.decimals
									).toString(),
								)
							}
							label={
								<AssetStack>
									<IconFlex>
										<img src={asset.icon} />
									</IconFlex>
									<p>{asset.underlyingSymbol}</p>
								</AssetStack>
							}
						/>
					</InputStack>
					<MarketStats operation={operation} asset={asset} amount={val} />
				</ModalStack>
			</Modal.Body>
			<Modal.Footer>
				<MarketButton
					operation={operation}
					asset={asset}
					val={
						val && !isNaN(val as any)
							? exponentiate(val, asset.decimals)
							: new BigNumber(0)
					}
					isDisabled={
						!val || !bao || isNaN(val as any) || parseFloat(val) > max()
					}
				/>
			</Modal.Footer>
		</Modal>
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
