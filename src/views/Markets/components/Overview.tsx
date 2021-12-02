import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import React from 'react'
import {
	buildStyles,
	CircularProgressbarWithChildren,
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { getDisplayBalance } from '../../../utils/numberFormat'
import {
	BorrowLimit,
	BorrowLimitWrapper,
	StatWrapper,
	UserStat,
	UserStatsContainer,
	UserStatsWrapper,
} from './styles'

export const Overview = () => {
	const accountLiquidity = useAccountLiquidity()

	const borrowLimit = accountLiquidity
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
					<StatWrapper>
						<UserStat>
							<h1>Total Supplied</h1>
							<p>
								$
								{`${
									accountLiquidity
										? getDisplayBalance(
												accountLiquidity.usdSupply.toFixed(2),
												0,
										  )
										: 0
								}`}
							</p>
						</UserStat>
					</StatWrapper>
					<div style={{ width: 150, height: 150 }}>
						<CircularProgressbarWithChildren
							value={borrowLimit}
							strokeWidth={5}
							styles={buildStyles({
								pathColor: '#50251c',
							})}
						>
							<div
								style={{
									flexBasis: '16.6666666667%',
									maxWidth: '16.6666666667%',
								}}
							>
								<BorrowLimitWrapper>
									<BorrowLimit>
										<h1>Borrow Limit</h1>
										<p>
											{`${
												accountLiquidity.usdBorrowable > 0
													? Math.floor(
															(accountLiquidity.usdBorrow /
																(accountLiquidity.usdBorrowable +
																	accountLiquidity.usdBorrow)) *
																100,
													  )
													: 0
											}`}
											%
										</p>
									</BorrowLimit>
								</BorrowLimitWrapper>
							</div>
						</CircularProgressbarWithChildren>
					</div>
					<StatWrapper>
						<UserStat>
							<h1>Total Borrowed</h1>
							<p>
								$
								{`${
									accountLiquidity
										? getDisplayBalance(
												accountLiquidity.usdBorrow.toFixed(2),
												0,
										  )
										: 0
								}`}
							</p>
						</UserStat>
					</StatWrapper>
				</UserStatsWrapper>
			</UserStatsContainer>
		</>
	) : (
		<></>
	)
}
