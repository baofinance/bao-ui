// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import fetcher from 'bao/lib/fetcher'
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import Web3ReactManager from 'components/Web3ReactManager'
import GlobalStyle from 'GlobalStyle'
import React, { useCallback, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { SWRConfig } from 'swr'
import Market from 'views/Markets/Market'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import BaoProvider from './contexts/BaoProvider'
import FarmsProvider from './contexts/Farms'
import MarketsProvider from './contexts/Markets'
import ModalsProvider from './contexts/Modals'
import TransactionProvider from './contexts/Transactions'
import theme from './theme'
import Ballast from './views/Ballast'
import Farms from './views/Farms'
import Markets from './views/Markets'
import NFT from './views/NFT'

library.add(fas, fab)

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
		if (localStorage.getItem('darkMode') === null)
			localStorage.setItem('darkMode', 'false')
		const isDarkMode = localStorage.getItem('darkMode') === 'true'
		setIsDarkMode(isDarkMode)
	}, [])

	return (
		<Providers isDarkMode={isDarkMode}>
			<Router>
				<TopBar
					isDarkMode={isDarkMode}
					toggleTheme={toggleTheme}
					onPresentMobileMenu={handlePresentMobileMenu}
				/>
				<MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
				<Switch>
					<Route path="/" exact>
						<Markets />
					</Route>
					<Route path="/markets/:marketId">
						<Market />
					</Route>
					<Route path="/ballast">
						<Ballast />
					</Route>
					<Route path="/farms">
						<Farms />
					</Route>
					<Route path="/NFT">
						<NFT />
					</Route>
				</Switch>
			</Router>
		</Providers>
	)
}

const Providers: React.FC<ProvidersProps> = ({
	children,
	isDarkMode,
}: ProvidersProps) => {
	return (
		<ThemeProvider theme={theme(isDarkMode)}>
			<GlobalStyle />
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
		</ThemeProvider>
	)
}

type ProvidersProps = {
	children: any
	isDarkMode: boolean
}

export default App
