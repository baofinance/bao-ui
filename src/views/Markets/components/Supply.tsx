import useModal from 'hooks/useModal'
import React from 'react'
import { MarketSupplyModal } from './Modals'
import {
	Flex,
	MarketContainer,
	MarketHeaderContainer,
	MarketHeaderStack,
	MarketHeader,
	MarketHeaderText,
	MarketHeaderSubText,
	MarketTableContainer,
	MarketTable,
	TableHeader,
	HeaderWrapper,
	ItemContainer,
	ItemWrapper,
} from './styles'

const Supply: React.FC = () => {
	const [handleSupply] = useModal(<MarketSupplyModal />)

	return (
		<>
			<Flex>
				<MarketContainer>
					<MarketHeaderContainer>
						<MarketHeaderStack>
							<MarketHeader>
								<Flex>
									<MarketHeaderText>Supply</MarketHeaderText>
								</Flex>
								<Flex>
									<MarketHeaderSubText>
										Earn interest on your deposits
									</MarketHeaderSubText>
								</Flex>
							</MarketHeader>
						</MarketHeaderStack>
					</MarketHeaderContainer>
					<MarketTableContainer>
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
									Liquidity
								</HeaderWrapper>
							</TableHeader>
							<ItemContainer onClick={handleSupply}>
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
									$1.0M
								</ItemWrapper>
							</ItemContainer>
						</MarketTable>
					</MarketTableContainer>
				</MarketContainer>
			</Flex>
		</>
	)
}

export default Supply
