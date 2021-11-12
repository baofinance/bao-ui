import React from 'react'
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
} from './style'
import { FormCheck, Row } from 'react-bootstrap'

const Supplied: React.FC = () => (
	<>
		<OverviewTableContainer>
			<MarketTable>
				<TableHeader>
					<HeaderWrapper>Asset</HeaderWrapper>
					<HeaderWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						APY
					</HeaderWrapper>
					<HeaderWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						Balance
					</HeaderWrapper>
					<HeaderWrapper
						style={{ justifyContent: 'flex-end', textAlign: 'end' }}
					>
						Collateral
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
					<ItemWrapper
						style={{
							justifyContent: 'flex-end',
							textAlign: 'end',
						}}
					>
						<FormCheck type="switch" id="custom-switch" />
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
							Total Supplied
						</MarketHeaderWrapper>
						<MarketHeaderWrapper
							style={{
								justifyContent: 'flex-end',
								textAlign: 'end',
							}}
						>
							Net APY
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
				</MarketSummary>{' '}
			</MarketTable>
		</OverviewTableContainer>
	</>
)

export default Supplied
