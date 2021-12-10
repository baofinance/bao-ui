import React from 'react'
import Config from '../../../bao/lib/config'
import useModal from '../../../hooks/useModal'
import WalletProviderModal from '../../../components/WalletProviderModal'
import { Button } from '../../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWallet } from 'use-wallet'

export const ConnectedCheck: React.FC = ({ children }) => {
	const [onPresentWalletProviderModal] = useModal(
		<WalletProviderModal />,
		'provider',
	)
	const { account, ethereum }: any = useWallet()

	return account && ethereum.chainId === Config.defaultRpc.chainId ? (
		<>{children}</>
	) : (
		<div style={{ width: '350px', margin: 'auto' }}>
			<Button onClick={onPresentWalletProviderModal}>
				<FontAwesomeIcon icon="wallet" style={{ marginRight: '5px' }} /> Connect
				Wallet to Enter App
			</Button>
		</div>
	)
}
