import React from 'react'
import BigNumber from 'bignumber.js'
import { useAccountLiquidity } from 'hooks/hard-synths/useAccountLiquidity'
import useHealthFactor from '../../../hooks/hard-synths/useHealthFactor'
import {
	buildStyles,
	CircularProgressbarWithChildren,
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { getDisplayBalance } from '../../../utils/numberFormat'
import Tooltipped from '../../../components/Tooltipped'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
	const healthFactor = useHealthFactor()

	const borrowLimit =
		accountLiquidity && accountLiquidity.usdBorrow !== 0
			? Math.floor(
					(accountLiquidity.usdBorrow /
						(accountLiquidity.usdBorrowable + accountLiquidity.usdBorrow)) *
						100,
			  )
			: 0

	// TODO: Better health factor color spectrum
	const healthFactorColor = (healthFactor: BigNumber) =>
		healthFactor.lte(1.25)
			? '#e32222'
			: healthFactor.lt(1.55)
			? '#ffdf19'
			: '#45be31'

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
							<h1>Your Collateral</h1>
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
					<div
						style={{
							width: 150,
							height: 150,
							marginRight: '75px',
							marginLeft: '75px',
						}}
					>
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
										<h1>Debt Limit</h1>
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
							<h1>Total Debt</h1>
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
							<h1>
								Health Factor{' '}
								<Tooltipped content="Your account health factor is calculated as follows: (USD supplied * average collateral factor) / USD borrowed. A health factor below 1.0 means you have exceeded your borrow limit and you will be liquidated." />
							</h1>
							<p
								style={{
									color: `${healthFactor && healthFactorColor(healthFactor)}`,
								}}
							>
								{healthFactor &&
									(healthFactor.isFinite() ? (
										healthFactor.toFixed(2)
									) : (
										<FontAwesomeIcon icon="infinity" />
									))}
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
