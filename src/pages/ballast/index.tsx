import { NextSeo } from 'next-seo'
import React from 'react'
import BallastSwapper from './components/BallastSwapper'

const Ballast: React.FC = () => {
	return (
		<>
			<NextSeo title={`Ballast`} description={`Buy and sell baoUSD for DAI.`} />
			<div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
				<BallastSwapper />
			</div>
		</>
	)
}

export default Ballast
