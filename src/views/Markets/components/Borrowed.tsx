import React from 'react'
import {
	Flex,
	HeaderWrapper,
	ItemContainer,
	ItemWrapper,
	MarketContainer,
	MarketHeader,
	MarketHeaderContainer,
	MarketHeaderStack,
	MarketHeaderSubText,
	MarketHeaderText,
	MarketTable,
	MarketTableContainer,
	OverviewTableContainer,
	TableHeader,
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
			</MarketTable>
		</OverviewTableContainer>
	</>
)

export default Borrowed
