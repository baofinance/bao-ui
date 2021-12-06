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

		const percentColors = [
			{ pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
			{ pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
			{ pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } } ]
		  
			const getColorForPercentage = (pct: any) => {
			  for (var i = 1; i < percentColors.length - 1; i++) {
				  if (pct < percentColors[i].pct) {
					  break;
				  }
			  }
			  const lower = percentColors[i - 1]
			  const upper = percentColors[i]
			  const range = upper.pct - lower.pct
			  const rangePct = (pct - lower.pct) / range
			  const pctLower = 1 - rangePct
			  const pctUpper = rangePct
			  const color = {
				  r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
				  g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
				  b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
			  }
			  return 'rgb(' + [color.r, color.g, color.b].join(',') + ')'
			  // or output as hex if preferred
		  }

	return accountLiquidity ? (
		<>
			<UserStatsContainer>
				<UserStatsWrapper>
					<StatWrapper>
						<UserStat>
							<h1>Net APY</h1>
							<p>
								{`${accountLiquidity ? accountLiquidity.netApy.toFixed(2) : 0}`}
								%
							</p>
						</UserStat>
					</StatWrapper>
					<StatWrapper>
						<UserStat>
							<h1>Total Supplied</h1>
							<p>
								$
								{`${
									accountLiquidity
										? getDisplayBalance(accountLiquidity.usdSupply, 0, 2)
										: 0
								}`}
							</p>
						</UserStat>
					</StatWrapper>
					<div style={{ width: 150, height: 150, marginRight: '75px', marginLeft: '75px' }}>
						<CircularProgressbarWithChildren
							value={borrowLimit}
							strokeWidth={10}
							styles={buildStyles({
								strokeLinecap: 'butt',
								pathColor: '#ce6509',
							})}
						>
							<div
								style={{
									flexBasis: '16.6666666667%',
									maxWidth: '16.6666666667%',
								}}
							>
								<BorrowLimitWrapper>
									<BorrowLimit style={{ marginTop: '15px' }}>
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
										? getDisplayBalance(accountLiquidity.usdBorrow, 0, 2)
										: 0
								}`}
							</p>
						</UserStat>
					</StatWrapper>
					<StatWrapper>
						<UserStat>
							<h1>Liquidation Risk</h1>
							<p style={{ color: 'green' }}>Low</p>
						</UserStat>
					</StatWrapper>
				</UserStatsWrapper>
			</UserStatsContainer>
		</>
	) : (
		<></>
	)
}
