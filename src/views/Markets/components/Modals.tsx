import { NavButtons } from 'components/Button'
import { BalanceInput } from 'components/Input'
import { ModalProps } from 'components/Modal'
import NewModal from 'components/NewModal'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { MarketButton } from './MarketButton'

export enum MarketOperations {
	supply = 'Supply',
	withdraw = 'Withdraw',
	borrow = 'Borrow',
	repay = 'Repay',
}

const MarketModal = ({
	onDismiss,
	operations,
}: ModalProps & { operations: MarketOperations[] }) => {

	const [val, setVal] = useState('')
	const [operation, setOperation] = useState(operations[0])
	const [amount, setAmount] = useState<string>('')

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
