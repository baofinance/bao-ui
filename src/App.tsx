// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useCallback, useState } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { UseWalletProvider } from 'use-wallet'
import MobileMenu from './components/MobileMenu'
import TopBar from './components/TopBar'
import BaoProvider from './contexts/BaoProvider'
import FarmsProvider from './contexts/Farms'
import ModalsProvider from './contexts/Modals'
import BasketsProvider from './contexts/Baskets'
import MarketsProvider from './contexts/Markets'
import TransactionProvider from './contexts/Transactions'
import theme from './theme'
import Farms from './views/Farms'
import Home from './views/Home'
import Baskets from './views/Baskets'
import Markets from './views/Markets'
import { SWRConfig } from 'swr'
import fetcher from 'bao/lib/fetcher'
library.add(fas, fab)

const url = new URL(window.location.toString())
if (url.searchParams.has('ref')) {
	document.querySelectorAll('a[href]').forEach((el) => {
		const attrUrl = new URL(el.getAttribute('href'))
		attrUrl.searchParams.set('ref', url.searchParams.get('ref'))
	})
}

const App: React.FC = () => {
	const [mobileMenu, setMobileMenu] = useState(false)

	const handleDismissMobileMenu = useCallback(() => {
		setMobileMenu(false)
	}, [setMobileMenu])

	const handlePresentMobileMenu = useCallback(() => {
		setMobileMenu(true)
	}, [setMobileMenu])

	return (
		<Providers>
			<Router>
				<TopBar onPresentMobileMenu={handlePresentMobileMenu} />
				<MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
				<Switch>
					<Route path="/" exact>
						<Home />
					</Route>
					{/* <Route path="/Baskets">
						<Baskets />
					</Route> */}
					<Route path="/Markets">
						<Markets />
					</Route>
					{/* <Route path="/Farms">
						<Farms />
					</Route> */}
				</Switch>
			</Router>
		</Providers>
	)
}

const Providers: React.FC = ({ children }) => {
	return (
		<ThemeProvider theme={theme}>
			<UseWalletProvider
				chainId={3}
				connectors={{
					walletconnect: { rpcUrl: 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' },
				}}
			>
				<BaoProvider>
					{/* <BasketsProvider> */}
					<MarketsProvider>
						<TransactionProvider>
							{/* <FarmsProvider> */}
							<SWRConfig
								value={{
									fetcher,
									refreshInterval: 300000,
								}}
							>
								<ModalsProvider>{children}</ModalsProvider>
							</SWRConfig>
							{/* </FarmsProvider> */}
						</TransactionProvider>
					</MarketsProvider>
					{/* </BasketsProvider> */}
				</BaoProvider>
			</UseWalletProvider>
		</ThemeProvider>
	)
}

export default App
