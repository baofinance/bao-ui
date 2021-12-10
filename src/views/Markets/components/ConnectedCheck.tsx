import React from 'react'
import useModal from '../../../hooks/useModal'
import useIsConnected from '../../../hooks/useIsConnected'
import WalletProviderModal from '../../../components/WalletProviderModal'
import { Button } from '../../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const ConnectedCheck: React.FC = ({ children }) => {
	const [onPresentWalletProviderModal] = useModal(
		<WalletProviderModal />,
		'provider',
	)
	const isConnected = useIsConnected()

	return isConnected ? (
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
