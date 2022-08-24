import PageHeader from '@/components/PageHeader'
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
			<PageHeader title='Markets' />
			{account ? (
				<>
					<Overview />
					<MarketList markets={markets} />
				</>
			) : (
				<OfflineMarketList markets={markets} />
			)}
		</>
	)
}

export default Markets
