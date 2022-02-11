import React, { useState } from 'react'
import Config from 'bao/lib/config'
import useModal from 'hooks/base/useModal'
import WalletProviderModal from 'components/WalletProviderModal'
import { Button } from 'components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWallet } from 'use-wallet'

export const ConnectedCheck: React.FC = ({ children }) => {
	const [onPresentWalletProviderModal] = useModal(
		<WalletProviderModal />,
		'provider',
	)
	const { account, ethereum }: any = useWallet()
	const [showWalletProviderModal, setShowWalletProviderModal] = useState(false)

	return account && ethereum.chainId === Config.defaultRpc.chainId ? (
		<>{children}</>
	) : (
		<>
			<div style={{ width: '350px', margin: 'auto' }}>
				<Button onClick={() => setShowWalletProviderModal(true)}>
					<FontAwesomeIcon icon="wallet" style={{ marginRight: '5px' }} />{' '}
					Connect Wallet to Enter App
				</Button>
			</div>

			<WalletProviderModal
				show={showWalletProviderModal}
				onHide={() => setShowWalletProviderModal(false)}
			/>
		</>
	)
}
