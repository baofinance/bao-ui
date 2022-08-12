import { useWeb3React } from '@web3-react/core'
import { SpinnerLoader } from 'components/Loader'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import { useMarkets } from 'hooks/markets/useMarkets'
import React, { Suspense } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'

const MarketList = React.lazy(() => import('./components/MarketList'))
const OfflineMarketList = React.lazy(() => import('./components/OfflineMarketList'))
const Overview = React.lazy(() => import('./components/Overview'))

const Markets: React.FC = () => {
	const markets = useMarkets()
	const { account } = useWeb3React()

	return (
		<Page>
			<Helmet>
				<title>Bao | Markets</title>
				<meta name='description' content='Mint and borrow synthetic assets with multiple types of collateral.' />
			</Helmet>
			<PageHeader icon='' title='Markets' />
			<Container>
				{account ? (
					<>
						{/* <StyledAlert variant="danger">
							Bao Markets is currently in a soft launch. Collateral Factors for
							synths are set low intentionally, and they will be adjusted as the
							protocol sees usage over the coming weeks. Please be prudent,{' '}
							<a href="https://docs.bao.finance">
								<FontAwesomeIcon icon={faFileAlt} /> read the docs
							</a>
							, and{' '}
							<a href="https://discord.gg/WPjtXXWnnU">
								<FontAwesomeIcon icon={faDiscord} /> ask questions
							</a>{' '}
							before interacting with the protocol at this time.
							<br />
							<br />
							Please report any UI bugs on the{' '}
							<a href="https://github.com/baofinance/bao-ui/issues">
								<FontAwesomeIcon icon={faGithub} /> UI's Github
								Repository
							</a>{' '}
							(preferred) or on our{' '}
							<a href="https://discord.gg/WPjtXXWnnU">
								<FontAwesomeIcon icon={faDiscord} /> Discord
							</a>
							.
						</StyledAlert> */}
						<Suspense fallback={<SpinnerLoader />}>
							<Overview />
							<MarketList markets={markets} />
						</Suspense>
					</>
				) : (
					<Suspense fallback={<SpinnerLoader />}>
						<OfflineMarketList markets={markets} />
					</Suspense>
				)}
			</Container>
		</Page>
	)
}

// TEMP
const StyledAlert = styled(Alert)`
	text-align: center;
	margin: 25px;

	> b {
		font-weight: bold;
	}

	> a {
		color: inherit;
		font-weight: bold;
	}

	@media (max-width: ${props => props.theme.breakpoints.sm}px) {
		font-size: 0.875rem;
	}
`

export default Markets
