import Tooltipped from 'components/Tooltipped'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import React from 'react'
import {
	BorrowLimit,
	BorrowMeterContainer,
	BorrowText, MarketHeaderContainer,
	OverviewContainer,
	OverviewHeader, ProductDescription, ProtocolStat, ProtocolStatsContainer, ProtocolStatsWrapper, SectionHeader, UserStat, UserStatsContainer, UserStatsWrapper
} from './styles'

export const ProtocolStats = () => {
	const accountLiquidity = useAccountLiquidity()

	return (
	<ProtocolStatsContainer>
	<ProtocolStatsWrapper>
		<ProductDescription>
			<h1>Bao Markets</h1>
			<p>This is some text about the Bao Markets product. We describe the basic functions and what makes it different here.</p>
		</ProductDescription>
	</ProtocolStatsWrapper>
	<ProtocolStatsWrapper>
		<ProtocolStat>
			<h1>Total Supply</h1>
			<p>${`${accountLiquidity ? accountLiquidity.usdBorrow.toFixed(2) : 0}`}{' '}</p>
		</ProtocolStat>
	</ProtocolStatsWrapper>
	<ProtocolStatsWrapper>
		<ProtocolStat>
			<h1>Total Borrow</h1>
			<p>${`${accountLiquidity ? accountLiquidity.usdSupply.toFixed(2) : 0}`}{' '}</p>
		</ProtocolStat>
	</ProtocolStatsWrapper>
</ProtocolStatsContainer>
	)
}
