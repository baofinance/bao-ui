import React, { useCallback, useState } from 'react'
import { SupportedMarket } from 'bao/lib/types'
import { NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import { Modal, ModalProps } from 'react-bootstrap'
import {
	useAccountBalances,
	useSupplyBalances,
} from 'hooks/hard-synths/useBalances'
import { useAccountLiquidity } from '../../../hooks/hard-synths/useAccountLiquidity'
import { useExchangeRates } from 'hooks/hard-synths/useExchangeRates'
import { useMarketPrices } from 'hooks/hard-synths/usePrices'
import useBao from 'hooks/useBao'
import BigNumber from 'bignumber.js'
import { MarketButton } from './MarketButton'
import { MarketStats } from './Stats'
import { decimate } from '../../../utils/numberFormat'
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

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	borrow = 'Borrow',
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
						? balances.find((_balance) => _balance.address === asset.token)
								.balance * exchangeRates[asset.token].toNumber()
						: 0
				const withdrawable = prices
					? accountLiquidity.usdBorrowable /
					  (asset.collateralFactor *
							decimate(
								prices[asset.token],
								new BigNumber(36).minus(asset.decimals),
							).toNumber())
					: 0
				return !accountLiquidity.usdBorrowable || withdrawable > supply ? supply : withdrawable
			case MarketOperations.borrow:
				return prices && accountLiquidity.usdBorrowable
					? accountLiquidity.usdBorrowable /
							decimate(
								prices[asset.token],
								new BigNumber(36).minus(asset.decimals),
							).toNumber()
					: 0
			case MarketOperations.repay:
				return balances
					? balances.find(
							(balances) => balances.address === asset.underlying || 'ETH',
					  ).balance
					: 0
		}
	}

	const maxLabel = () => {
		switch (operation) {
			case MarketOperations.supply:
				return 'Wallet'
			case MarketOperations.withdraw:
				return 'Withdrawable'
			case MarketOperations.borrow:
				return 'Borrowable'
			case MarketOperations.repay:
				return 'Wallet'
		}
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					<HeaderWrapper>
						<img src={asset.icon} />
						<p>{asset.symbol}</p>
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
									{`${Math.floor(max() * 1e8) / 1e8} ${asset.symbol}`}
								</AssetLabel>
							</LabelStack>
						</LabelFlex>

						<BalanceInput
							value={val}
							onChange={handleChange}
							onMaxClick={() =>
								setVal((Math.floor(max() * 1e8) / 1e8).toString())
							}
							label={
								<AssetStack>
									<IconFlex>
										<img src={asset.icon} />
									</IconFlex>
									<p>{asset.symbol}</p>
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
							? decimate(val, asset.decimals)
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
		operations={[MarketOperations.borrow, MarketOperations.repay]}
		asset={asset}
		show={show}
		onHide={onHide}
	/>
)
