import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button/Button'
import Loader, { PageLoader } from '@/components/Loader'
import PageHeader from '@/components/PageHeader'
import { StatBlock, StatCards } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { useBorrowBalances, useSupplyBalances } from '@/hooks/markets/useBalances'
import { useExchangeRates } from '@/hooks/markets/useExchangeRates'
import { useMarkets } from '@/hooks/markets/useMarkets'
import formatAddress from '@/utils/formatAddress'
import GraphUtil from '@/utils/graph'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft, faChartLine, faExternalLinkAlt, faLandmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import MarketListwDash from './components/MarketListwDash'
import MarketBorrowModal from './components/Modals/BorrowModal'
import MarketSupplyModal from './components/Modals/SupplyModal'
import { MarketDetails } from './components/Stats'

export async function getStaticPaths() {
	return {
		paths: [{ params: { market: 'baoUSD' } }, { params: { market: 'baoETH' } }],
		fallback: false, // can also be true or 'blocking'
	}
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps({ params }: { params: { market: string; name: string } }) {
	const { market, name } = params

	return {
		props: {
			marketId: market,
			marketName: name,
		},
	}
}

const Market: NextPage<{
	marketId: string
	marketName: string
}> = ({ marketId, marketName }) => {
	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				<MarketListwDash marketName={marketName} />
			</>
		</>
	)
}

export default Market
