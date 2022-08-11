// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import fetcher from 'bao/lib/fetcher'
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import { SpinnerLoader } from 'components/Loader'
import Web3ReactManager from 'components/Web3ReactManager'
import GlobalStyle from 'GlobalStyle'
import React, { ReactNode, Suspense, useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { SWRConfig } from 'swr'
import Web3 from 'web3'
import { provider } from 'web3-core'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import BaoProvider from './contexts/BaoProvider'
import FarmsProvider from './contexts/Farms'
import MarketsProvider from './contexts/Markets'
import ModalsProvider from './contexts/Modals'
import TransactionProvider from './contexts/Transactions'
import theme from './theme'

library.add(fas, fab)

function getLibrary(provider: provider) {
	return new Web3(provider)
}

const Web3ReactNetworkProvider = createWeb3ReactRoot('network')

const Markets = React.lazy(() => import('views/Markets'))
const Market = React.lazy(() => import('views/Markets/Market'))
const Ballast = React.lazy(() => import('views/Ballast'))
const Baskets = React.lazy(() => import('views/Baskets'))
const Basket = React.lazy(() => import('views/Baskets/Basket'))
const Farms = React.lazy(() => import('views/Farms'))
const NFT = React.lazy(() => import('views/NFT'))

const App: React.FC = () => {
	const [mobileMenu, setMobileMenu] = useState(false)
	const [isDarkMode, setIsDarkMode] = useState(false)

	const handleDismissMobileMenu = useCallback(() => {
		setMobileMenu(false)
	}, [setMobileMenu])

	const handlePresentMobileMenu = useCallback(() => {
		setMobileMenu(true)
	}, [setMobileMenu])

	const toggleTheme = useCallback(() => {
		localStorage.setItem('darkMode', isDarkMode ? 'false' : 'true')
		setIsDarkMode(!isDarkMode)
	}, [isDarkMode])

	// Remember darkmode prefs
	useEffect(() => {
		if (localStorage.getItem('darkMode') === null) localStorage.setItem('darkMode', 'false')
		const isDarkMode = localStorage.getItem('darkMode') === 'true'
		setIsDarkMode(isDarkMode)
	}, [])

	return (
		<Providers isDarkMode={isDarkMode}>
			<Router>
				<TopBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} onPresentMobileMenu={handlePresentMobileMenu} />
				<MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
				<Suspense fallback={<SpinnerLoader />}>
					<Routes>
						<Route path='/' element={<Markets />} />
						<Route path='/markets/:marketId' element={<Market />} />
						<Route path='/ballast' element={<Ballast />} />
						<Route path='/farms' element={<Farms />} />
						<Route path='/baskets' element={<Baskets />} />
						<Route path='/baskets/:basketId' element={<Basket />} />
						<Route path='/NFT' element={<NFT />} />
					</Routes>
				</Suspense>
			</Router>
		</Providers>
	)
}

const Providers: React.FC<ProvidersProps> = ({ children, isDarkMode }: ProvidersProps) => {
	return (
		<ThemeProvider theme={theme(isDarkMode)}>
			<GlobalStyle />
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
											<ModalsProvider>{children}</ModalsProvider>
										</SWRConfig>
									</TransactionProvider>
								</FarmsProvider>
							</MarketsProvider>
						</BaoProvider>
					</Web3ReactManager>
				</Web3ReactNetworkProvider>
			</Web3ReactProvider>
		</ThemeProvider>
	)
}

type ProvidersProps = {
	children: ReactNode
	isDarkMode: boolean
}

export default App
