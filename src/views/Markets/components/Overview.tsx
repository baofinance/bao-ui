import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import Tooltipped from 'components/Tooltipped'
import useBao from 'hooks/base/useBao'
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
import { useWeb3React } from '@web3-react/core'
import {
	StatWrapper,
	UserStat,
	UserStatsContainer,
	UserStatsWrapper,
} from 'components/Stats'

export const Overview = () => {
	const bao = useBao()
	const { account } = useWeb3React()
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

	const healthFactorColor = (healthFactor: BigNumber) =>
		healthFactor.eq(0)
			? `${(props: any) => props.theme.color.text[100]}`
			: healthFactor.lte(1.25)
			? '#e32222'
			: healthFactor.lt(1.55)
			? '#ffdf19'
			: '#45be31'

	return bao && account && accountLiquidity ? (
		<>
			<UserStatsContainer md={3}>
				<UserStatsWrapper md={5}>
					<StatWrapper xs={6}>
						<UserStat>
							<h1>Net APY</h1>
							<p>
								{`${
									bao && account && accountLiquidity
										? accountLiquidity.netApy.toFixed(2)
										: 0
								}`}
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
									bao && account && accountLiquidity
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
								pathColor: `${
									healthFactor ? healthFactorColor(healthFactor) : '#fff'
								}`,
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
												bao && account && accountLiquidity.usdBorrowable > 0
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
									bao && account && accountLiquidity
										? getDisplayBalance(accountLiquidity.usdBorrow, 0, 2)
										: 0
								}`}
							</p>
						</UserStat>
					</StatWrapper>
					<StatWrapper xs={6}>
						<UserStat>
							<h1>
								Health Factor
								<Tooltipped content="Your account health factor is calculated as follows: ∑(collateral_usd * collateral_factor) / borrowed_usd. A health factor below 1.0 means you have exceeded your borrow limit and you will be liquidated." />
							</h1>
							<p
								style={{
									color: `${healthFactor && healthFactorColor(healthFactor)}`,
								}}
							>
								{healthFactor &&
									(healthFactor.isFinite() ? (
										healthFactor.lte(0) ? (
											'-'
										) : healthFactor.gt(10000) ? (
											<p>
												{'>'} 10000 {' '}
												<Tooltipped content={`Your health factor is ${healthFactor}.`} />
											</p>
										) : (
											healthFactor.toFixed(2)
										)
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
										fontWeight: '500',
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
										bao && account && accountLiquidity.usdBorrowable > 0
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
								<p>${`${getDisplayBalance(borrowable, 0)}`}</p>
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
	border: none;
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
