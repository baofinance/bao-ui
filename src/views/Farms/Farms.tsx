import { Button } from 'components/Button'
import { Container } from 'react-bootstrap'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import Spacer from 'components/Spacer'
import WalletProviderModal from 'components/WalletProviderModal'
import useModal from 'hooks/base/useModal'
import React from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import Config from '../../bao/lib/config'
import Farm from '../Farm'
import Balances from './components/Balances'
import { StyledInfo } from './components/styles'
import ExternalLink from 'components/ExternalLink'
import useFarms from 'hooks/farms/useFarms'
import { SpinnerLoader } from 'components/Loader'
import { FarmList } from './components/FarmList'

const Farms: React.FC = () => {
	const { path } = useRouteMatch()
	const { account, ethereum }: any = useWallet()
	const [onPresentWalletProviderModal] = useModal(<WalletProviderModal />)

	return (
		<Switch>
			<Page>
				{account && ethereum.chainId === Config.defaultRpc.chainId ? (
					<>
							<PageHeader
								icon=""
								title="Farms"
								subtitle="Earn BAO by staking Sushiswap & Uniswap LP Tokens!"
							/>
							<Container>
								<Balances />
								<Spacer size="md" />
								<FarmList />
							</Container>
					</>
				) : (
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							flex: 1,
							justifyContent: 'center',
						}}
					>
						<Button
							onClick={onPresentWalletProviderModal}
							text="🔓 Unlock Wallet"
						/>
					</div>
				)}
			</Page>
		</Switch>
	)
}

export default Farms
