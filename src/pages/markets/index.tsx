import Page from '@/components/Page'
import Typography from '@/components/Typography'
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
			<Page>
				<Typography variant='hero' className='font-strong text-center tracking-tighter text-text-100 antialiased'>
					Markets
				</Typography>
				{account ? (
					<>
						<Overview />
						<MarketList markets={markets} />
					</>
				) : (
					<OfflineMarketList markets={markets} />
				)}
			</Page>
		</>
	)
}

export default Markets
