import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import Tooltipped from 'components/Tooltipped'
import { useAccountLiquidity } from 'hooks/markets/useAccountLiquidity'
import useHealthFactor from 'hooks/markets/useHealthFactor'
import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import {
	buildStyles,
	CircularProgressbarWithChildren,
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import styled from 'styled-components'
import { black } from 'theme/lightColors'
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

	const borrowable = accountLiquidity
		? accountLiquidity.usdBorrow + accountLiquidity.usdBorrowable
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

				<BorrowLimitWrapper md={2}>
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
								<CircularProgressbarWrapper>
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
								</CircularProgressbarWrapper>
							</div>
						</CircularProgressbarWithChildren>
					</BorrowLimitContainer>
				</BorrowLimitWrapper>

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

				<DebtLimitContainer>
					<DebtLimitWrapper>
						<DebtLimit>
							<DebtLimitLabel>
								<div
									style={{
										display: 'flex',
										whiteSpace: 'nowrap',
										color: `${(props: any) => props.theme.color.text[200]}`,
										fontSize: '0.875rem',
										fontWeight: 500,
									}}
								>
									Debt Limit
								</div>
								<p
									style={{
										marginTop: '0',
										marginInlineEnd: '0',
										marginBottom: '0',
										marginInlineStart: '0.5rem',
									}}
								>
									{`${
										accountLiquidity.usdBorrowable > 0
											? Math.floor(
													(accountLiquidity.usdBorrow /
														(accountLiquidity.usdBorrowable +
															accountLiquidity.usdBorrow)) *
														100,
											  )
											: 0
									}%`}{' '}
								</p>
							</DebtLimitLabel>

							<ProgressBarWrapper>
								<ProgressBar style={{ width: `${borrowLimit}%` }} />
							</ProgressBarWrapper>

							<BorrowableLabel>
								<p>${borrowable}</p>
							</BorrowableLabel>
						</DebtLimit>
					</DebtLimitWrapper>
				</DebtLimitContainer>
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

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		padding: 1rem 12px;
		padding-inline-start: 0.75rem;
		padding-inline-end: 0.75rem;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		min-width: 120px;
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

//Circular Progress Bar

const BorrowLimitContainer = styled.div`
	width: 150px;
	height: 150px;
	box-sizing: unset;
	margin: auto;

	@media (max-width: ${(props) => props.theme.breakpoints.xl}px) {
		width: 135px;
		height: 135px;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		display: none;
	}
`

export const CircularProgressbarWrapper = styled.div`
	height: 130px;
	width: 130px;
	position: relative;
	left: 50%;
	transform: translateX(-50%);
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: 50%;

	@media (max-width: ${(props) => props.theme.breakpoints.xl}px) {
		height: 110px;
		width: 110px;
	}

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		display: none;
	}
`

const BorrowLimitWrapper = styled(Col)`
	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		display: none;
	}
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

// Horizontal Progress Bar

const DebtLimitContainer = styled.div`
	width: 100%;
	display: none;

	@media (max-width: ${(props) => props.theme.breakpoints.lg}px) {
		display: flex;
	}
`

const DebtLimitWrapper = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	background-color: ${(props) => props.theme.color.primary[100]};
	border-radius: 8px;
	margin-top: 1rem;
	padding: 1rem;
	border: ${(props) => props.theme.border.default};
`

const DebtLimit = styled.div`
	flex-direction: row;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	font-size: 0.875rem;
	font-weight: 600;
`

const DebtLimitLabel = styled.div`
	display: flex;
	align-items: center;
	flex-direction: row;
`

const ProgressBar = styled.div`
	display: flex;
	height: 100%;
	border-radius: 8px;
	background-color: ${(props) => props.theme.color.text[100]};
`

const ProgressBarWrapper = styled.div`
	display: flex;
	width: 100%;
	height: 0.25rem;
	border-radius: 8px;
	background-color: ${(props) => props.theme.color.primary[400]};
	margin-inline-start: 0.5rem;
`

const BorrowableLabel = styled.div`
	display: flex;
	align-items: center;
	flex-direction: row;
	margin-inline-start: 0.5rem;

	p {
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
	}
`
