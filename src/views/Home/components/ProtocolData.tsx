import { SpinnerLoader } from 'components/Loader'
import useProtocolData from 'hooks/useProtocolData'
import React from 'react'
import { Analytic, AnalyticsContainer } from './styles'
import gql from 'graphql-tag'
import styled from 'styled-components'

const ProtocolData: React.FC = () => {
	const protocolData = useProtocolData()
	return (
		<AnalyticsContainer sm={1} lg={4}>
			{protocolData ? (
				protocolData.map((_analytic) => (
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

export default ProtocolData
