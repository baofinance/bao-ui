import { AbsoluteContainer } from '@/components/Container'
import Page from '@/components/Page'
import { NextSeo } from 'next-seo'
import React from 'react'
import BallastSwapper from './components/BallastSwapper'

const Ballast: React.FC = () => {
	return (
		<>
			<NextSeo title={`Ballast`} description={`Buy and sell baoUSD for DAI.`} />
			<Page>
				<AbsoluteContainer>
					<BallastSwapper />
				</AbsoluteContainer>
			</Page>
		</>
	)
}

export default Ballast
