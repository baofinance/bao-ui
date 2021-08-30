import React from 'react'
import useHomeAnalytics from '../../../hooks/useHomeAnalytics'
import styled from 'styled-components'
import { Row, Col } from 'react-bootstrap'
import { SpinnerLoader } from '../../../components/Loader'

const HomeAnalytics: React.FC = () => {
	const homeAnalytics = useHomeAnalytics()
	return (
		<AnalyticsContainer lg={4}>
			{homeAnalytics ? (
				homeAnalytics.map((_analytic) => (
					<Analytic key={Math.random().toString()}>
						<span>
							<h2>{_analytic.data}</h2>
							{_analytic.title}
						</span>
					</Analytic>
				))
			) : (
				<div
					style={{
						width: '100%',
						margin: 'auto',
					}}
				>
					<SpinnerLoader block={true} />
				</div>
			)}
		</AnalyticsContainer>
	)
}

const AnalyticsContainer = styled(Row)`
	height: 128px;
	border-radius: 15px;
	background-color: rgba(0, 0, 0, 0.5);
	margin-top: 200px; // bubble container is 600px high with 100 px margin top/bottom
	position: absolute;
	width: 80%;
	left: 50%;
	transform: translateX(-50%);
	padding: 2em;
	backdrop-filter: blur(5px);
`

const Analytic = styled(Col)`
	margin: auto;
	text-align: center;
	height: 75%;
	border-right: 1px solid rgba(255, 255, 255, 0.25);
	display: flex;
	align-items: center;
	justify-content: center;

	span > h2 {
		font-family: 'Rubik', sans-serif;
	}

	&:last-child {
		border-right: none;
	}
`

export default HomeAnalytics
