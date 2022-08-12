import { useMarkets } from '@/hooks/markets/useMarkets'
import { useWeb3React } from '@web3-react/core'
import { NextSeo } from 'next-seo'
import React from 'react'
import MarketList from './components/MarketList'
import OfflineMarketList from './components/OfflineMarketList'
import Overview from './components/Overview'

const Markets: React.FC = () => {
	const markets = useMarkets()
	const { account } = useWeb3React()

	return (
		<>
			<NextSeo title={'Markets'} description={'Provide different collateral types to mint synthetics like baoUSD.'} />
			<div className='max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8'>
				<h1 className='font-kaushan text-xxxl antialiased font-strong text-center tracking-tighter text-text-dark-100'>Markets</h1>
				{account ? (
					<>
						<Overview />
						<MarketList markets={markets} />
					</>
				) : (
					<OfflineMarketList markets={markets} />
				)}
			</div>
		</>
	)
}

export default Markets
