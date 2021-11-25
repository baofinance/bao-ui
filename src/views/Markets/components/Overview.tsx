import Tooltipped from 'components/Tooltipped'
import { commify } from 'ethers/lib/utils'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import React from 'react'
import {
	BorrowLimit,
	BorrowMeterContainer,
	BorrowText, MarketHeaderContainer,
	OverviewContainer,
	OverviewHeader, ProductDescription, ProtocolStat, ProtocolStatsContainer, ProtocolStatsWrapper, SectionHeader, UserStat, UserStatsContainer, UserStatsWrapper
} from './styles'

export const Overview = () => {
	const accountLiquidity = useAccountLiquidity()

	const dynamicWidth = accountLiquidity
		? Math.floor(
			(accountLiquidity.usdBorrow /
				(accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) *
			100,
		)
		: 0

	return accountLiquidity ? (
		<>
			<OverviewContainer>
				<OverviewHeader>
					<BorrowLimit>
						Borrow Limit <Tooltipped content={`Some info here.`} />
					</BorrowLimit>
					<BorrowText>
						{`${accountLiquidity.usdBorrowable > 0
							? Math.floor(
								(accountLiquidity.usdBorrow /
									(accountLiquidity.usdBorrowable +
										accountLiquidity.usdBorrow)) *
								100,
							)
							: 0
							}`}
						%
					</BorrowText>
					<BorrowMeterContainer>
						<div style={{
							width: `${dynamicWidth}%`,
							display: 'flex',
							height: '100%',
							borderRadius: '8px',
							backgroundColor: '#50251c',
						}} />
					</BorrowMeterContainer>
					<BorrowText>
						$
						{`${accountLiquidity
							? commify(
								(
									accountLiquidity.usdBorrowable +
									accountLiquidity.usdBorrow
								).toFixed(2),
							)
							: '0.00'
							}`}
					</BorrowText>
				</OverviewHeader>
			</OverviewContainer>
			<MarketHeaderContainer>
				<UserStatsContainer>
					<UserStatsWrapper>
						<UserStat>
							<h1>Net APY</h1>
							<p>{`${accountLiquidity ? accountLiquidity.netApy.toFixed(2) : 0}`} %</p>
						</UserStat>
					</UserStatsWrapper>
					<UserStatsWrapper>
						<UserStat>
							<h1>Total Borrowed</h1>
							<p>${`${accountLiquidity ? accountLiquidity.usdBorrow.toFixed(2) : 0}`}{' '}</p>
						</UserStat>
					</UserStatsWrapper>
					<UserStatsWrapper>
						<UserStat>
							<h1>Total Supplied</h1>
							<p>${`${accountLiquidity ? accountLiquidity.usdSupply.toFixed(2) : 0}`}{' '}</p>
						</UserStat>
					</UserStatsWrapper>
				</UserStatsContainer>
			</MarketHeaderContainer>
		</>
	) : (
		<></>
	)
}
