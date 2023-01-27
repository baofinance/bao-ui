import PageHeader from '@/components/PageHeader'
import { useWeb3React } from '@web3-react/core'
import { NextSeo } from 'next-seo'
import React from 'react'
import MarketList from './markets/components/MarketList'
import OfflineMarketList from './markets/components/OfflineMarketList'
import Overview from './markets/components/Overview'
import { Context, MarketsContext } from '@/contexts/Markets'

const Markets: React.FC = () => {
	const { account } = useWeb3React()

	return (
		<>
			<NextSeo title={'Markets'} description={'Provide different collateral types to mint synthetics like baoUSD.'} />
			<PageHeader title='Markets' />
			{account ? (
				<>
					<Overview marketName='baoUSD' />
					<MarketList marketName='baoUSD' />
					<Overview marketName='baoETH' />
					<MarketList marketName='baoETH' />
				</>
			) : (
				<OfflineMarketList marketName='baoUSD' />
			)}
		</>
	)
}

export default Markets
