import Tooltipped from 'components/Tooltipped'
import React from 'react'
import styled from 'styled-components'

const Overview = () => (
	<>
		<OverviewContainer>
			<OverviewHeader>
				<BorrowLimit>
					Borrow Limit{' '}<Tooltipped content={`Some info here.`} />
				</BorrowLimit>
				<BorrowText>0%</BorrowText>
				<BorrowMeterContainer>
					<BorrowMeter />
				</BorrowMeterContainer>
				<BorrowText>$0</BorrowText>
			</OverviewHeader>
		</OverviewContainer>
	</>
)

const OverviewContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`

const OverviewHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: row;
	width: 100%;
	font-size: 0.875rem;
	font-weight: ${(props) => props.theme.fontWeight.medium};
	padding: 24px;
`

const BorrowLimit = styled.div`
	white-space: nowrap;
	color: ${(props) => props.theme.color.text[100]};
	font-size: 1rem;
`

const BorrowText = styled.p`
	margin-top: 0px;
	margin-inline-end: .5rem;
	margin-bottom: 0px;
	margin-inline-start: .5rem;
`

const BorrowMeterContainer = styled.div`
	display: flex;
	width: 100%;
	height: 0.25rem;
	border-radius: 8px;
	background-color: ${(props) => props.theme.color.transparent[100]};
`

const BorrowMeter = styled.div`
	display: flex;
	width: 50%;
	height: 100%;
	border-radius: 8px;
	background-color: ${(props) => props.theme.color.secondary[200]};
`

export default Overview
