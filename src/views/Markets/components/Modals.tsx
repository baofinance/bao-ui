import React, { useCallback, useState } from 'react'
import { SupportedMarket } from 'bao/lib/types'
import { NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import NewModal, { NewModalProps } from 'components/NewModal'
import {
	useAccountBalances,
	useSupplyBalances,
} from 'hooks/hard-synths/useBalances'
import { useAccountLiquidity } from '../../../hooks/hard-synths/useAccountLiquidity'
import { useExchangeRates } from 'hooks/hard-synths/useExchangeRates'
import { useMarketPrices } from 'hooks/hard-synths/usePrices'
import useBao from 'hooks/useBao'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { MarketButton } from './MarketButton'
import { MarketStats } from './Stats'
import { decimate } from '../../../utils/numberFormat'
export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	borrow = 'Borrow',
	repay = 'Repay',
}

type MarketModalProps = NewModalProps & {
	asset: SupportedMarket
}

const MarketModal = ({
	onDismiss,
	operations,
	asset,
}: MarketModalProps & { operations: MarketOperations[] }) => {
	const [operation, setOperation] = useState(operations[0])
	const [val, setVal] = useState<string>('')
	const bao = useBao()
	const balances = useAccountBalances()
	const supplyBalances = useSupplyBalances()
	const { prices } = useMarketPrices()
	const { usdBorrowable } = useAccountLiquidity()
	const { exchangeRates } = useExchangeRates()

	const max = () => {
		switch (operation) {
			case MarketOperations.supply:
				return balances
					? balances.find((_balance) => _balance.address === asset.underlying)
							.balance
					: 0
			case MarketOperations.withdraw:
				const supply =
					supplyBalances && exchangeRates
						? balances.find((_balance) => _balance.address === asset.token)
								.balance * exchangeRates[asset.token].toNumber()
						: 0
				const withdrawable = prices
					? usdBorrowable /
					  (asset.collateralFactor *
							decimate(
								prices[asset.token],
								new BigNumber(36).minus(asset.decimals),
							).toNumber())
					: 0
				return !usdBorrowable || withdrawable > supply ? supply : withdrawable
			case MarketOperations.borrow:
				return prices && usdBorrowable
					? usdBorrowable /
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

	const handleDismiss = () => {
		setVal('')
		onDismiss()
	}

	return (
		<NewModal
			onDismiss={handleDismiss}
			header={
				<HeaderWrapper>
					<img src={asset.icon} />
					<p>{asset.symbol}</p>
				</HeaderWrapper>
			}
			footer={
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
			}
		>
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
		</NewModal>
	)
}

export const MarketSupplyModal = ({ onDismiss, asset }: MarketModalProps) => (
	<MarketModal
		operations={[MarketOperations.supply, MarketOperations.withdraw]}
		asset={asset}
		onDismiss={onDismiss}
	/>
)

export const MarketBorrowModal = ({ onDismiss, asset }: MarketModalProps) => (
	<MarketModal
		operations={[MarketOperations.borrow, MarketOperations.repay]}
		asset={asset}
		onDismiss={onDismiss}
	/>
)

const HeaderWrapper = styled.div`
	display: flex;
	align-items: center;
	flex-direction: row;
	min-width: 6rem;

	img {
		vertical-align: middle;
		height: 2rem;
		width: 2rem;
	}

	p {
		display: block;
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin: 0px;
		margin-top: 0px;
		margin-inline: 0.5rem 0px;
		margin-bottom: 0px;
		color: ${(props) => props.theme.color.text[100]};
		font-size: 1.25rem;
		font-weight: ${(props) => props.theme.fontWeight.medium};
	}
`

const ModalStack = styled.div`
	display: flex;
	flex-direction: column;
	padding: 1rem;
	width: 100%;
`

const InputStack = styled.div`
	display: flex;
	-webkit-box-align: center;
	align-items: center;
	flex-direction: column;
	margin-top: 1rem;
	margin-inline: 0px;
	margin-bottom: 0px;
`

const LabelFlex = styled.div`
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	width: 100%;
`

const LabelStack = styled.div`
	display: flex;
	align-items: flex-end;
	flex-direction: row;
`

const MaxLabel = styled.p`
	color: ${(props) => props.theme.color.text[200]};
	font-size: 0.875rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
	margin-bottom: 0px;
`

const AssetLabel = styled.p`
	color: ${(props) => props.theme.color.text[100]};
	font-size: 0.875rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
	margin-inline-start: 0.25rem;
	margin-bottom: 0px;
`

const AssetStack = styled.div`
	display: flex;
	align-items: center;
	flex-direction: row;
	padding-left: 0.5rem;
	padding-right: 1rem;

	p {
		margin-top: 0px;
		margin-inline: 0.5rem 0px;
		margin-bottom: 0px;
		color: ${(props) => props.theme.color.text[100]};
		text-align: center;
		font-size: 1.125rem;
		font-weight: ${(props) => props.theme.fontWeight.medium};
	}
`

const IconFlex = styled.div`
	display: flex;
	width: 1.25rem;

	img {
		display: block;
		vertical-align: middle;
		width: 1.25rem;
		height: 1.25rem;
	}
`
