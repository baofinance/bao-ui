import Config from '@/bao/lib/config'
import { coinbaseWallet, injected, walletConnect } from '@/bao/lib/connectors'
import { useEagerConnect, useInactiveListener } from '@/bao/lib/hooks'
import Button from '@/components/Button'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { useWeb3React } from '@web3-react/core'
import React, { FC, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Modal from '../Modal'
import Typography from '../Typography'

const connectorsByName: { [name: string]: AbstractConnector } = {
	Metamask: injected,
	'Coinbase Wallet': coinbaseWallet,
	WalletConnect: walletConnect,
}

interface WalletProviderModalProps {
	show: boolean
	onHide: () => void
}

const WalletProviderModal: FC<WalletProviderModalProps> = ({ show, onHide }) => {
	const { connector, chainId, account, activate, active, error } = useWeb3React()

	useEffect(() => {
		if (account && chainId === Config.networkId) {
			onHide()
		}
	}, [account, chainId, onHide])

	const [activatingConnector, setActivatingConnector] = useState<any>()

	useEffect(() => {
		if (activatingConnector && activatingConnector === connector) {
			setActivatingConnector(undefined)
		}
	}, [activatingConnector, connector])

	const triedEager = useEagerConnect()

	useInactiveListener(!triedEager || !!activatingConnector)

	useEffect(() => {
		if (account && active) {
			onHide()
		}
	}, [account, active, onHide])

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	if (window.ethereum && window.ethereum.chainId !== Config.defaultRpc.chainId) {
		try {
			window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: Config.defaultRpc.chainId }],
			})
		} catch (error: any) {
			if (error.code === 4902) {
				window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [Config.defaultRpc],
				})
			}
		}
	}

	return (
		<Modal isOpen={show} onDismiss={onHide}>
			<Modal.Header
				header='Select a wallet provider'
				onClose={onHide}
			/>
			<Modal.Actions>
				{Object.keys(connectorsByName).map(name => {
					const currentConnector = connectorsByName[name]
					const activating = currentConnector === activatingConnector
					const connected = currentConnector === connector
					const disabled = !triedEager || !!activatingConnector || connected || !!error

					return (
						<Button
							fullWidth
							size='md'
							disabled={disabled}
							key={name}
							onClick={() => {
								setActivatingConnector(currentConnector)
								activate(connectorsByName[name], error => {
									if (error) {
										setActivatingConnector(undefined)
									}
								})
							}}
						>
							<div className='flex h-full items-center'>
								<img className='inline-block' src={`/images/wallets/${name}.png`} alt={name} />
								<Typography className='ml-2 inline-block font-semibold'>{activating ? 'Connecting...' : `${name}`}</Typography>
							</div>
						</Button>
					)
				})}
			</Modal.Actions>
		</Modal>
	)
}

export default WalletProviderModal
