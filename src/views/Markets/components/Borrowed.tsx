import useModal from 'hooks/useModal'
import React from 'react'
import { MarketBorrowModal } from './Modals'
import {
	HeaderWrapper,
	ItemContainer,
	ItemWrapper,
	MarketHeaderWrapper,
	MarketItemContainer,
	MarketItemWrapper,
	MarketSummary,
	MarketSummaryHeader,
	MarketTable,
	OverviewTableContainer,
	TableHeader,
} from './styles'

const Borrowed: React.FC = () => {

	const [handleBorrow] = useModal(<MarketBorrowModal />)

	return (
		<>
			<OverviewTableContainer>
				<MarketTable>
					<TableHeader>
						<HeaderWrapper>Asset</HeaderWrapper>
						<HeaderWrapper
							style={{ justifyContent: 'center', textAlign: 'center' }}
						>
							APR
						</HeaderWrapper>
						<HeaderWrapper
							style={{ justifyContent: 'flex-end', textAlign: 'end' }}
						>
							Balance
						</HeaderWrapper>
					</TableHeader>
					<ItemContainer onClick={handleBorrow}>
						<ItemWrapper>
							<img src="USDC.png" />
							<p>USDC</p>
						</ItemWrapper>
						<ItemWrapper
							style={{
								justifyContent: 'center',
								textAlign: 'center',
							}}
						>
							5.00%
						</ItemWrapper>
						<ItemWrapper
							style={{
								justifyContent: 'flex-end',
								textAlign: 'end',
							}}
						>
							500 USDC
						</ItemWrapper>
					</ItemContainer>
					<MarketSummary>
						<MarketSummaryHeader>
							<MarketHeaderWrapper
								style={{
									justifyContent: 'flex-start',
									textAlign: 'start',
								}}
							>
								Total Debt
							</MarketHeaderWrapper>
							<MarketHeaderWrapper
								style={{
									justifyContent: 'flex-end',
									textAlign: 'end',
								}}
							>
								Net APR
							</MarketHeaderWrapper>
						</MarketSummaryHeader>
						<MarketItemContainer>
							<MarketItemWrapper
								style={{ justifyContent: 'flex-start', textAlign: 'start' }}
							>
								$500
							</MarketItemWrapper>
							<MarketItemWrapper
								style={{ justifyContent: 'flex-end', textAlign: 'end' }}
							>
								5.00%
							</MarketItemWrapper>
						</MarketItemContainer>
					</MarketSummary>
				</MarketTable>
			</OverviewTableContainer>
		</>
	)
}

export default Borrowed
