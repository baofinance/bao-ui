import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import Config from 'bao/lib/config'
import { Button } from '../../Button'
import Spacer from '../../Spacer'
import WalletModalCard from '../../WalletModalCard'
import { Card } from 'react-bootstrap'
import styled from 'styled-components'

interface WalletCardProps {
	icon: React.ReactNode
	onConnect: () => void
	title: string
}

const WalletCard: React.FC<WalletCardProps> = ({ icon, onConnect, title }) => {
	const wallet: any = useWallet()

	const [buttonText, setButtonText] = useState<any>()
	useEffect(() => {
		_getButtonText(wallet.ethereum, wallet.status).then((res: any) =>
			setButtonText(res),
		)
	}, [wallet])

	return (
		<WalletModalCard>
			<Card.Body>
				<WalletIcon>{icon}</WalletIcon>
				<WalletTitle>{title}</WalletTitle>
			</Card.Body>
			<Card.Footer>
				<Button
					onClick={onConnect}
					text={
						buttonText || (
							<span>
								<FontAwesomeIcon icon="wifi" /> Wrong Network
							</span>
						)
					}
				/>
			</Card.Footer>
		</WalletModalCard>
	)
}

const _getButtonText = async (ethereum: any, status: string): Promise<any> => {
	if (ethereum && ethereum.chainId !== Config.defaultRpc.chainId) {
		try {
			await ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: Config.defaultRpc.chainId }],
			})
		} catch (error) {
			if (error.code === 4902) {
				await ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [Config.defaultRpc],
				})
			}
		}
	} else {
		return status === 'connecting' ? 'Connecting...' : 'Connect'
	}
}

export default WalletCard

const WalletIcon = styled.div`
	background-color: ${(props) => props.theme.color.grey[200]};
	font-size: 36px;
	height: 80px;
	width: 80px;
	border-radius: 40px;
	align-items: center;
	display: flex;
	justify-content: center;
	box-shadow: inset 4px 4px 8px ${(props) => props.theme.color.grey[300]},
		inset -6px -6px 12px ${(props) => props.theme.color.grey[100]};
	margin: 0 auto ${(props) => props.theme.spacing[3]}px;
`

const WalletTitle = styled.div`
	color: ${(props) => props.theme.color.grey[600]};
	font-size: 18px;
	font-weight: 700;
	padding: ${(props) => props.theme.spacing[4]}px;
	text-align: center;
`