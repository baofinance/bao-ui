import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import Tooltipped from 'components/Tooltipped'
import { useAccountLiquidity } from 'hooks/markets/useAccountLiquidity'
import useHealthFactor from 'hooks/markets/useHealthFactor'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import {
	buildStyles,
	CircularProgressbarWithChildren,
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import styled from 'styled-components'
import { getDisplayBalance } from 'utils/numberFormat'

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
			<UserStatsContainer md={3}>
				<UserStatsWrapper md={5}>
					<StatWrapper xs={6}>
						<UserStat>
							<h1>Net APY</h1>
							<p>
								{`${accountLiquidity ? accountLiquidity.netApy.toFixed(2) : 0}`}
								%
							</p>
						</UserStat>
					</StatWrapper>
					<StatWrapper xs={6}>
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
				</UserStatsWrapper>

				<UserStatsWrapper md={2}>
					<BorrowLimitContainer>
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
					</BorrowLimitContainer>
				</UserStatsWrapper>

				<UserStatsWrapper md={5}>
					<StatWrapper xs={6}>
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
					<StatWrapper xs={6}>
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

export const UserStatsContainer = styled(Row)`
	position: relative;
	margin: 0 12px 50px;
	justify-content: space-evenly;
`

export const UserStatsWrapper = styled(Col)`
	align-items: center;
	display: flex;
	flex-flow: row wrap;
	margin-right: -0.665rem;
	margin-left: -0.665rem;
	justify-content: space-evenly;
`

export const StatWrapper = styled(Col)`
	background-color: ${(props) => props.theme.color.primary[100]};
	margin: 0.5rem 0.5rem;
	border-radius: 8px;
	position: relative;
	flex: 1 1 0%;
	padding-inline-start: 1rem;
	padding-inline-end: 1rem;
	padding: 1.25rem 16px;
	border: ${(props) => props.theme.border.default};

	@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
		padding: 1rem 12px;
		padding-inline-start: 0.75rem;
		padding-inline-end: 0.75rem;
	}
`

export const UserStat = styled.div`
	overflow-wrap: break-word;
	text-align: center;

	p {
		font-size: 1.5rem;
		margin: 0px;

		@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
			font-size: 0.875rem;
		}
	}

	h1 {
		font-size: 0.875rem;
		color: ${(props) => props.theme.color.text[200]};
		margin: 0px;

		@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
			font-size: 0.75rem;
		}
	}
`

const BorrowLimitContainer = styled.div`
	width: 150px;
	height: 150px;
	box-sizing: unset;

	@media (max-width: ${(props) => props.theme.breakpoints.sm}px) {
		display: none;
	}
`

export const BorrowLimitWrapper = styled.div`
	height: 135px;
	width: 135px;
	position: relative;
	left: 50%;
	transform: translateX(-50%);
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: 50%;
`

export const BorrowLimit = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 50%;
	align-items: center;
	justify-content: center;
	padding: 0.25rem;

	p {
		font-size: 1.5rem;
		margin: 0px;
	}

	h1 {
		font-size: 0.875rem;
		color: ${(props) => props.theme.color.text[200]};
		margin: 0px;
	}
`
