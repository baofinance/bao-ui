import '@/styles/globals.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { Web3ReactProvider } from '@web3-react/core'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'
import React, { ReactNode } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from '@/utils/queryClient'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Header from '@/components/Header'
import Page from '@/components/Page'
import Web3ReactManager from '@/components/Web3ReactManager'
import SEO from '@/bao/lib/seo'
import BaoProvider from '@/contexts/BaoProvider'
import FarmsProvider from '@/contexts/Farms'
import VaultsProvider from '@/contexts/Vaults'
import TransactionProvider from '@/contexts/Transactions'
import TxPopup from '@/components/TxPopup'
import '@/components/TxPopup/styles.css'

console.log('v1.3.4')

function getLibrary(provider: any): Web3Provider {
	const library = new Web3Provider(provider)
	library.pollingInterval = 12000
	return library
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
					content='Lend and borrow synthetics with Bao Vaults and get diversified expsoure to crypto with automated yield bearing strategies using Bao Baskets.'
				/>
				<meta property='og:type' content='website' />
				<meta property='og:url' content='app.bao.finance' />
				<meta property='og:title' content='Bao Finance - Deliciously wrapped finance!' />
				<meta
					property='og:description'
					content='Lend and borrow synthetics with Bao Vaults and get diversified expsoure to crypto with automated yield bearing strategies using Bao Baskets.'
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
		<QueryClientProvider client={queryClient}>
			<Web3ReactProvider getLibrary={getLibrary}>
				<Web3ReactNetworkProvider getLibrary={getLibrary}>
					<Web3ReactManager>
						<BaoProvider>
							<TransactionProvider>
								<VaultsProvider>
									<FarmsProvider>{children}</FarmsProvider>
								</VaultsProvider>
							</TransactionProvider>
						</BaoProvider>
					</Web3ReactManager>
				</Web3ReactNetworkProvider>
			</Web3ReactProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	)
}

type ProvidersProps = {
	children: ReactNode
}

export default App
