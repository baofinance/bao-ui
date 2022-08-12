import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import wethIcon from 'assets/img/tokens/ETH.png'
import baoIcon from 'assets/img/tokens/BAO.png'
import Config from 'bao/lib/config'
import { BigNumber } from 'bignumber.js'
import { CloseButton } from 'components/Button/Button'
import { MaxLabel } from 'components/Label'
import { SpinnerLoader } from 'components/Loader'
import useTokenBalance from 'hooks/base/useTokenBalance'
import useTransactionProvider from 'hooks/base/useTransactionProvider'
import _ from 'lodash'
import React, { useCallback } from 'react'
import { Col, Modal, ModalProps, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { getBalanceNumber, getDisplayBalance } from 'utils/numberFormat'
import { Button } from '../../Button'
import Spacer from '../../Spacer'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

const AccountModal = ({ onHide, show }: ModalProps) => {
	const { account, deactivate } = useWeb3React()

	const handleSignOutClick = useCallback(() => {
		onHide()
		deactivate()
	}, [onHide, deactivate])

	const { transactions } = useTransactionProvider()
	const baoBalance = useTokenBalance(Config.addressMap.BAO)
	const ethBalance = useTokenBalance('ETH')

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal show={show} onHide={hideModal} centered>
			<CloseButton onHide={hideModal} onClick={onHide} />
			<Modal.Header>
				<Modal.Title id='contained-modal-title-vcenter'>
					<p>My Account</p>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<WalletBalances>
					<WalletBalancesInner>
						<WalletBalance>
							<InnerWalletBalance>
								<InnerInnerWalletBalance>
									<WalletBalanceImage>
										<img src={wethIcon} alt='ETH' />
									</WalletBalanceImage>
									<WalletBalanceSpace />
									<WalletBalanceText>
										<WalletBalanceValue>{getBalanceNumber(ethBalance).toFixed(4)}</WalletBalanceValue>
										<WalletBalanceTicker>ETH Balance</WalletBalanceTicker>
									</WalletBalanceText>
								</InnerInnerWalletBalance>
							</InnerWalletBalance>
						</WalletBalance>
						<WalletBalance>
							<InnerWalletBalance>
								<InnerInnerWalletBalance>
									<WalletBalanceImage>
										<img src={baoIcon} alt='BAO' />
									</WalletBalanceImage>
									<WalletBalanceSpace />
									<WalletBalanceText>
										<WalletBalanceValue>{getDisplayBalance(baoBalance)}</WalletBalanceValue>
										<WalletBalanceTicker>BAO Balance</WalletBalanceTicker>
									</WalletBalanceText>
								</InnerInnerWalletBalance>
							</InnerWalletBalance>
						</WalletBalance>
					</WalletBalancesInner>
				</WalletBalances>
				<>
					<Spacer size='sm' />
					<TransactionWrapper>
						<span>
							<span style={{ float: 'left', fontSize: '0.875rem' }}>Recent Transactions</span>
							{Object.keys(transactions).length > 0 && (
								<small>
									<span>
										<ClearButton
											onClick={() => {
												localStorage.setItem('transactions', '{}')
												window.location.reload()
											}}
										>
											<FontAwesomeIcon icon={faTimes} style={{ verticalAlign: 'middle' }} /> Clear
										</ClearButton>
									</span>
								</small>
							)}
						</span>
						<Spacer size='md' />
						{Object.keys(transactions).length > 0 ? (
							<>
								{_.reverse(Object.keys(transactions))
									.slice(0, 5)
									.map(txHash => (
										<StatText key={txHash}>
											<MaxLabel>
												{transactions[txHash].receipt ? (
													<FontAwesomeIcon
														icon={faCheck}
														style={{
															color: 'green',
														}}
													/>
												) : (
													<SpinnerLoader />
												)}
											</MaxLabel>
											<MaxLabel style={{ textAlign: 'end' }}>{transactions[txHash].description}</MaxLabel>
										</StatText>
									))}
							</>
						) : (
							<StatText>
								<MaxLabel>Your completed transactions will show here...</MaxLabel>
							</StatText>
						)}
					</TransactionWrapper>
				</>
			</Modal.Body>
			<Modal.Footer>
				<Button href={`${Config.defaultRpc.blockExplorerUrls[0]}/address/${account}`} text='View on Explorer' />
				<Button onClick={handleSignOutClick} text='Sign out' />
			</Modal.Footer>
		</Modal>
	)
}

const WalletBalances = styled.div`
	display: flex;
	padding: 24px;
`

const WalletBalancesInner = styled(Row)`
	display: flex;
	width: 100%;
`

const WalletBalance = styled(Col)`
	flex: 1 1 0%;
	display: block;
`

const InnerWalletBalance = styled.div`
	display: flex;
	justify-content: center;
`

const InnerInnerWalletBalance = styled.div`
	-webkit-box-align: center;
	align-items: center;
	display: flex;
`

const WalletBalanceImage = styled.div`
	display: flex;
	-webkit-box-pack: center;
	justify-content: center;
	min-width: 48px;
	min-height: 48px;
	border-radius: 40px;
	background-color: ${props => props.theme.color.primary[400]};
	border: none;

	img {
		height: 34px;
		text-align: center;
		min-width: 34px;
		margin: auto;
	}
`

const WalletBalanceSpace = styled.div`
	height: 8px;
	min-height: 8px;
	min-width: 8px;
	width: 8px;
`

const WalletBalanceText = styled.div`
	display: block;
	flex: 1 1 0%;
`

const WalletBalanceValue = styled.div`
	font-size: 24px;
	font-weight: 700;
`

const WalletBalanceTicker = styled.div`
	color: ${props => props.theme.color.text[200]};
	font-size: 0.875rem;
`

const StatText = styled.div`
	transition-property: all;
	transition-duration: 200ms;
	transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	font-weight: ${props => props.theme.fontWeight.medium};
	font-size: ${props => props.theme.fontSize.default};
	padding-top: ${props => props.theme.spacing[1]}px;
	padding-bottom: ${props => props.theme.spacing[1]}px;
	padding-left: ${props => props.theme.spacing[2]}px;
	padding-right: ${props => props.theme.spacing[2]}px;
	border-radius: 8px;

	p {
		color: ${props => props.theme.color.text[100]};
		font-size: ${props => props.theme.fontSize.default};
		font-weight: ${props => props.theme.fontWeight.medium};
		display: block;
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin: 0px;
		margin-top: 0px;
		margin-inline: 0.5rem 0px;
		margin-bottom: 0px;
	}
`

const ClearButton = styled.button`
	float: right;
	vertical-align: middle;
	background-color: ${props => props.theme.color.primary[300]} !important;
	border-radius: 8px;
	border: none;
	color: ${props => props.theme.color.text[100]};

	&:hover {
		background-color: ${props => props.theme.color.primary[400]} !important;
	}
`

export const TransactionWrapper = styled(Col)`
	background-color: ${props => props.theme.color.primary[200]};
	margin: 0.5rem 0.5rem;
	border-radius: 8px;
	position: relative;
	flex: 1 1 0%;
	padding-inline-start: 1rem;
	padding-inline-end: 1rem;
	padding: 1.25rem 16px;
	border: none;

	@media (max-width: ${props => props.theme.breakpoints.lg}px) {
		padding: 1rem 12px;
		padding-inline-start: 0.75rem;
		padding-inline-end: 0.75rem;
	}

	@media (max-width: ${props => props.theme.breakpoints.lg}px) {
		min-width: 120px;
	}
`

export default AccountModal
