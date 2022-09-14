import '@/styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'

import { Web3ReactProvider } from '@web3-react/core'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'
import React, { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import Web3 from 'web3'
import { provider } from 'web3-core'

import fetcher from '@/bao/lib/fetcher'
import Header from '@/components/Header'
import Page from '@/components/Page'
import Web3ReactManager from '@/components/Web3ReactManager'
import SEO from '@/bao/lib/seo'
import BaoProvider from '@/contexts/BaoProvider'
import FarmsProvider from '@/contexts/Farms'
import MarketsProvider from '@/contexts/Markets'
import TransactionProvider from '@/contexts/Transactions'
import TxPopup from '@/components/TxPopup'
import '@/components/TxPopup/styles.css'

function getLibrary(provider: provider) {
	return new Web3(provider)
}

const Web3ReactNetworkProvider = dynamic(() => import('@/components/Web3NetworkProvider'), { ssr: false })

function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta name='application-name' content='Bao Finance' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='apple-mobile-web-app-status-bar-style' content='default' />
				<meta name='apple-mobile-web-app-title' content='Bao Finance' />
				<meta name='description' content='Deliciously wrapped finance!' />
				<meta name='format-detection' content='telephone=no' />
				<meta name='mobile-web-app-capable' content='yes' />
				<meta name='theme-color' content='#fff8ee' />
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta httpEquiv='cache-control' content='no-cache' />
				<meta httpEquiv='expires' content='0' />
				<meta httpEquiv='pragma' content='no-cache' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:image' content='%PUBLIC_URL%/twitterCard.png' />
				<meta name='twitter:title' content='Bao Finance - Deliciously wrapped finance!' />
				<meta name='twitter:creator' content='@BaoCommunity' />
				<meta name='twitter:site' content='@BaoCommunity' />
				<meta
					key='twitter:description'
					name='twitter:description'
					content='Lend and borrow synthetics with Bao Markets and get diversified expsoure to crypto with automated yield bearing strategies using Bao Baskets.'
				/>
				<meta property='og:type' content='website' />
				<meta property='og:url' content='app.bao.finance' />
				<meta property='og:title' content='Bao Finance - Deliciously wrapped finance!' />
				<meta
					property='og:description'
					content='Lend and borrow synthetics with Bao Markets and get diversified expsoure to crypto with automated yield bearing strategies using Bao Baskets.'
				/>
				<meta property='og:image' content='%PUBLIC_URL%/twitterCard.png' />{' '}
			</Head>
			<Providers>
				<DefaultSeo {...SEO} />
				<Header />
				<main>
					<TxPopup />
					<Page>
						<Component {...pageProps} />
					</Page>
				</main>
			</Providers>
		</>
	)
}

const Providers: React.FC<ProvidersProps> = ({ children }: ProvidersProps) => {
	return (
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ReactNetworkProvider getLibrary={getLibrary}>
				<Web3ReactManager>
					<BaoProvider>
						<MarketsProvider>
							<FarmsProvider>
								<TransactionProvider>
									<SWRConfig
										value={{
											fetcher,
											refreshInterval: 300000,
										}}
									>
										{children}
									</SWRConfig>
								</TransactionProvider>
							</FarmsProvider>
						</MarketsProvider>
					</BaoProvider>
				</Web3ReactManager>
			</Web3ReactNetworkProvider>
		</Web3ReactProvider>
	)
}

type ProvidersProps = {
	children: ReactNode
}

export default App
