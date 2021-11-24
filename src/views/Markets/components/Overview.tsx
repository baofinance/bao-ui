import Tooltipped from 'components/Tooltipped'
import { commify } from 'ethers/lib/utils'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import React from 'react'
import {
	BorrowLimit,
	BorrowMeterContainer,
	BorrowText,
	HeaderWrapper,
	MarketHeaderContainer,
	OverviewContainer,
	OverviewHeader,
	TableHeader
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
			<MarketHeaderContainer>
				<TableHeader>
					<HeaderWrapper>
						{`${accountLiquidity ? accountLiquidity.netApy.toFixed(2) : 0}`} %
						Net APY
					</HeaderWrapper>
					<HeaderWrapper
						style={{ justifyContent: 'center', textAlign: 'center' }}
					>
						${`${accountLiquidity ? accountLiquidity.usdBorrow.toFixed(2) : 0}`}{' '}
						Borrowed
					</HeaderWrapper>
					<HeaderWrapper
						style={{ justifyContent: 'flex-end', textAlign: 'end' }}
					>
						${`${accountLiquidity ? accountLiquidity.usdSupply.toFixed(2) : 0}`}{' '}
						Supplied
					</HeaderWrapper>
				</TableHeader>
			</MarketHeaderContainer>
			<OverviewContainer>
				<OverviewHeader>
					<BorrowLimit>
						Borrow Limit <Tooltipped content={`Some info here.`} />
					</BorrowLimit>
					<BorrowText>
						{`${accountLiquidity
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
		</>
	) : (
		<></>
	)
}
