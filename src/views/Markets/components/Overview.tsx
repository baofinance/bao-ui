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
import { getDisplayBalance } from '../../../utils/numberFormat'

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
			<UserStatsContainer>
				<UserStatsWrapper>
					<UserStat>
						<h1>Net APY</h1>
						<p>{`${accountLiquidity ? accountLiquidity.netApy.toFixed(2) : 0}`}%</p>
					</UserStat>
				</UserStatsWrapper>
				<UserStatsWrapper>
					<UserStat>
						<h1>Total Borrowed</h1>
						<p>
							${`${accountLiquidity ? getDisplayBalance(accountLiquidity.usdBorrow.toFixed(2), 0) : 0}`}
						</p>
					</UserStat>
				</UserStatsWrapper>
				<UserStatsWrapper>
					<UserStat>
						<h1>Total Supplied</h1>
						<p>
							${`${accountLiquidity ? getDisplayBalance(accountLiquidity.usdSupply.toFixed(2), 0) : 0}`}
						</p>
					</UserStat>
				</UserStatsWrapper>
				<UserStatsWrapper>
					<UserStat>
						<h1>Liquidation Risk</h1>
						<p style={{ color: 'green' }}>Low</p>
					</UserStat>
				</UserStatsWrapper>
			</UserStatsContainer>
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
							? getDisplayBalance(
								(
									accountLiquidity.usdBorrowable +
									accountLiquidity.usdBorrow
								).toFixed(2),
								0
							)
							: '0.00'
						}`}
					</BorrowText>
				</OverviewHeader>
			</OverviewContainer>
		</>
	) : (
		<></>
	)
}
