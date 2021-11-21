import baoBaskets from 'assets/img/Bao.png'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import WalletProviderModal from 'components/WalletProviderModal'
import useModal from 'hooks/useModal'
import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import Basket from '../Basket'
import BasketList from './components/BasketList'

const Baskets: React.FC = () => {
	const { path } = useRouteMatch()
	const { account, ethereum }: any = useWallet()
	const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)
	return (
		<Switch>
			<Page>
				<>
					<Route exact path={path}>
						<PageHeader
							icon=''
							title="Baskets"
							subtitle="Tokenized baskets with autonomous yield bearing strategies!"
						/>
						<BasketList />
					</Route>
					<Route path={`${path}/:basketId`}>
						<Basket />
					</Route>
				</>
			</Page>
		</Switch>
	)
}

export default Baskets
