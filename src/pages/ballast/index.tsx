import { AbsoluteContainer } from '@/components/Container'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import BallastSwapper from './components/BallastSwapper'

const Ballast: React.FC = () => {
	return (
		<>
			<NextSeo title={`Ballast`} description={`Buy and sell baoUSD for DAI.`} />
			{isDesktop ? (
				<AbsoluteContainer>
					<BallastSwapper />
				</AbsoluteContainer>
			) : (
				<BallastSwapper />
			)}
		</>
	)
}

export default Ballast
