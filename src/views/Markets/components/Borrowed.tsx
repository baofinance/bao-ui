import React from 'react'
import { Row } from 'react-bootstrap'
import {
	MarketSummary,
	HeaderWrapper,
	ItemContainer,
	ItemWrapper,
	MarketTable,
	OverviewTableContainer,
	TableHeader,
	MarketHeaderWrapper,
	MarketItemContainer,
	MarketItemWrapper,
	MarketSummaryHeader,
} from './style'

const Borrowed: React.FC = () => (
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
				<ItemContainer>
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
							Total Borrowed
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

export default Borrowed
