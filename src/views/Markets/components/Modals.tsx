import { SupportedMarket } from 'bao/lib/types'
import { NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import { ModalProps } from 'components/Modal'
import NewModal, { NewModalProps } from 'components/NewModal'
import { Market } from 'contexts/Markets'
import { BigNumber } from 'ethers/lib/ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useAccountBalances, useSupplyBalances } from 'hooks/hard-synths/useBalances'
import { useExchangeRates } from 'hooks/hard-synths/useExchangeRates'
import { useMarketPrices } from 'hooks/hard-synths/usePrices'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { MarketButton } from './MarketButton'

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	borrow = 'Borrow',
	repay = 'Repay',
}

type MarketModalProps = NewModalProps & {
}

const MarketModal = ({
	operations,
}: MarketModalProps & { operations: MarketOperations[] }) => {

	const [val, setVal] = useState('')
	const [operation, setOperation] = useState(operations[0])
	const [amount, setAmount] = useState<string>('')
	const balances = useAccountBalances()
	const supplyBalances = useSupplyBalances()
	const { prices } = useMarketPrices()
	const { useBorrowable } = useAccountLiquidity()
	const { exchangeRates } = useExchangeRates()

	// const max = () => {
	// 	switch (operation) {
	// 		case MarketOperations.supply:
	// 			return balances
	// 				? parseFloat(formatUnits(balances[asset.underlying], asset.decimals))
	// 				: 0
	// 		case MarketOperations.withdraw:
	// 			const supply =
	// 				supplyBalances && exchangeRates
	// 					? parseFloat(formatUnits(supplyBalances[asset.token], asset.decimals)) *
	// 					parseFloat(formatUnits(exchangeRates[asset.token]))
	// 					: 0
	// 			const withdrawable = prices
	// 				? usdBorrowable /
	// 				(asset.collateralFactor *
	// 					parseFloat(formatUnits(prices[asset.token], BigNumber.from(36).sub(asset.decimals))))
	// 				: 0
	// 			return !usdBorrowable || withdrawable > supply ? supply : withdrawable
	// 		case MarketOperations.borrow:
	// 			return prices && usdBorrowable
	// 				? usdBorrowable /
	// 				parseFloat(formatUnits(prices[asset.token], BigNumber.from(36).sub(asset.decimals)))
	// 				: 0
	// 		case MarketOperations.repay:
	// 			return balances
	// 				? parseFloat(formatUnits(balances[asset.underlying || 'ETH'], asset.decimals))
	// 				: 0
	// 	}
	// }

	
	// const maxLabel = () => {
	// 	switch (operation) {
	// 	  case MarketOperations.supply:
	// 		return 'Wallet'
	// 	  case MarketOperations.withdraw:
	// 		return 'Withdrawable'
	// 	  case MarketOperations.borrow:
	// 		return 'Borrowable'
	// 	  case MarketOperations.repay:
	// 		return 'Wallet'
	// 	}
	//   }


	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	return (
		<NewModal
			header={
				<HeaderWrapper>
					<img src="USDC.png" />
					<p>USDC</p>
				</HeaderWrapper>
			}
			footer={<MarketButton operation={operation} />}
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
							<MaxLabel>Wallet:</MaxLabel>
							<AssetLabel>500.000 USDC</AssetLabel>
						</LabelStack>
					</LabelFlex>

					<BalanceInput
						value={amount}
						onChange={handleChange}
						onMaxClick={() => setAmount}
						label={
							<AssetStack>
								<IconFlex>
									<img src="USDC.png" />
								</IconFlex>
								<p>USDC</p>
							</AssetStack>
						}
					/>
				</InputStack>
			</ModalStack>
		</NewModal>
	)
}

export const MarketSupplyModal = ({ }: ModalProps) => (
	<MarketModal
		operations={[MarketOperations.supply, MarketOperations.withdraw]}
	/>
)

export const MarketBorrowModal = ({ }: ModalProps) => (
	<MarketModal operations={[MarketOperations.borrow, MarketOperations.repay]} />
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
function useAccountLiquidity(): { useBorrowable: any } {
	throw new Error('Function not implemented.')
}

