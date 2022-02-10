import React, { useCallback } from 'react'
import { BigNumber } from 'bignumber.js'
import Config from '../../../bao/lib/config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import wethIcon from 'assets/img/assets/WETH.png'
import baoIcon from 'assets/img/logo.svg'
import useBao from 'hooks/base/useBao'
import useTokenBalance from 'hooks/base/useTokenBalance'
import useTransactionProvider from '../../../hooks/base/useTransactionProvider'
import { Col, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { getDisplayBalance } from 'utils/numberFormat'
import { Button } from '../../Button'
import { CloseButton } from '../../../views/Markets/components/styles'
import CardIcon from '../../CardIcon'
import Label from '../../Label'
import Modal, { ModalProps } from '../../Modal'
import ModalContent from '../../ModalContent'
import ModalTitle from '../../ModalTitle'
import Spacer from '../../Spacer'
import Value from '../../Value'
import { StatBlock } from '../../../views/Markets/components/Stats'
import _ from 'lodash'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
	const { account, reset } = useWallet()

	const handleSignOutClick = useCallback(() => {
		onDismiss!()
		reset()
	}, [onDismiss, reset])

	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const baoBalance = useTokenBalance(bao.getContract('polly').options.address)
	const wethBalance = useTokenBalance('ETH')

	return (
		<Modal>
			<CloseButton onClick={onDismiss}>
				<FontAwesomeIcon icon="times" />
			</CloseButton>
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
								<Label text="ETH Balance" />
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
				{Object.keys(transactions).length > 0 && (
					<>
						<p>
							<span style={{ float: 'left' }}>Recent Transactions</span>
							<small>
								<a
									href="#"
									style={{ float: 'right' }}
									onClick={() => {
										localStorage.setItem('transactions', '{}')
										window.location.reload()
									}}
								>
									<FontAwesomeIcon icon="times" /> Clear
								</a>
							</small>
						</p>
						<Spacer size="sm" />
						<StatBlock
							label={null}
							stats={_.reverse(Object.keys(transactions))
								.slice(0, 5)
								.map((txHash) => ({
									label: transactions[txHash].description,
									value: transactions[txHash].receipt ? 'Completed' : 'Pending',
								}))}
						/>
					</>
				)}
				<Spacer />
				<Button
					href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${account}`}
					text="View on Explorer"
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
