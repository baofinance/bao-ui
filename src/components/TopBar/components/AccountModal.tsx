import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import wethIcon from 'assets/img/assets/WETH.png'
import baoIcon from 'assets/img/logo.svg'
import { BigNumber } from 'bignumber.js'
import useBao from 'hooks/useBao'
import useTokenBalance from 'hooks/useTokenBalance'
import React, { useCallback } from 'react'
import { Col, Row, CloseButton } from 'react-bootstrap'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { getDisplayBalance } from 'utils/numberFormat'
import Config from '../../../bao/lib/config'
import { Button } from '../../Button'
import CardIcon from '../../CardIcon'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalContent from '../../ModalContent'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'
import Value from '../../Value'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
	const { account, reset } = useWallet()

	const handleSignOutClick = useCallback(() => {
		onDismiss!()
		reset()
	}, [onDismiss, reset])

	const bao = useBao()
	const baoBalance = useTokenBalance(bao.getContract('polly').options.address)
	const wethBalance = useTokenBalance(Config.addressMap.WETH)

	return (
		<Modal>
			<CloseButton onClick={onDismiss} />
			<ModalTitle text="My Account" />
			<ModalContent>
				<Row lg={2}>
					<Col>
						<StyledBalanceWrapper>
							<CardIcon>
								<span>
									<img src={wethIcon} height={50} />
								</span>
							</CardIcon>
							<StyledBalance>
								<Value
									value={new BigNumber(getDisplayBalance(wethBalance)).toFixed(
										4,
									)}
								/>
								<Label text="WETH Balance" />
							</StyledBalance>
						</StyledBalanceWrapper>
					</Col>
					<Col>
						<StyledBalanceWrapper>
							<CardIcon>
								<span>
									<img src={baoIcon} height={50} />
								</span>
							</CardIcon>
							<StyledBalance>
								<Value value={getDisplayBalance(baoBalance)} />
								<Label text="BAO Balance" />
							</StyledBalance>
						</StyledBalanceWrapper>
					</Col>
				</Row>

				<Spacer />
				<Button
					href={`https://polygonscan.com/address/${account}`}
					text="View on Polygonscan"
				/>
				<Spacer />
				<Button onClick={handleSignOutClick} text="Sign out" />
			</ModalContent>
		</Modal>
	)
}

const StyledBalance = styled.div`
	align-items: center;
	display: flex;
	flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
	align-items: center;
	display: flex;
	flex: 1;
	flex-direction: column;
	margin-bottom: ${(props) => props.theme.spacing[4]}px;

	@media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
		flex-direction: row;
	}
`

export default AccountModal
