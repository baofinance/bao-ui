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
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<PageHeader title='Vaults' />
			<>
				<MarketList marketName='baoUSD' />
			</>
		</>
	)
}

export default Markets
