import useModal from 'hooks/useModal'
import React from 'react'
import { MarketBorrowModal } from './Modals'
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
	TableHeader,
} from './styles'

const Borrow: React.FC = () => {
	const [handleBorrow] = useModal(<MarketBorrowModal />)

	return (
		<>
			<Flex>
				<MarketContainer>
					<MarketHeaderContainer>
						<MarketHeaderStack>
							<MarketHeader>
								<Flex>
									<MarketHeaderText>Borrow</MarketHeaderText>
								</Flex>
								<Flex>
									<MarketHeaderSubText>
										Borrow against your supplied collateral
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

export default Borrow
