import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'bignumber.js'
import useModal from 'hooks/useModal'
import { useWallet } from 'use-wallet'
import useTokenBalance from '../../../hooks/useTokenBalance'
import { getDisplayBalance } from '../../../utils/numberFormat'
import { Button } from '../../Button'
import WalletProviderModal from '../../WalletProviderModal'
import AccountModal from './AccountModal'
import useTransactionProvider from '../../../hooks/useTransactionProvider'
import { SpinnerLoader } from '../../Loader'

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = (props) => {
	const [onPresentAccountModal] = useModal(<AccountModal />)
	const [onPresentWalletProviderModal] = useModal(
		<WalletProviderModal />,
		'provider',
	)

	const { transactions } = useTransactionProvider()
	const { account } = useWallet()
	const wethBalance = useTokenBalance('ETH')

	const handleUnlockClick = useCallback(() => {
		onPresentWalletProviderModal()
	}, [onPresentWalletProviderModal])

	const pendingTxs = useMemo(
		() =>
			Object.keys(transactions).filter(
				(txHash) => !transactions[txHash].receipt,
			).length,
		[transactions],
	)

	return (
		<>
			<StyledAccountButton>
				{!account ? (
					<Button
						onClick={handleUnlockClick}
						size="sm"
						text={
							<>
								Connect Wallet{' '}
								<FontAwesomeIcon
									icon="link"
									style={{
										marginLeft: '4px',
									}}
								/>
							</>
						}
						border={true}
					/>
				) : (
					<Button
						onClick={onPresentAccountModal}
						size="sm"
						text={
							<>
								{account.slice(0, 6)}...
								{account.slice(account.length - 4, account.length)}{' '}
								<FontAwesomeIcon
									icon="angle-double-right"
									style={{
										margin: '0 4px',
										color: '#b07a6e',
									}}
								/>{' '}
								{new BigNumber(getDisplayBalance(wethBalance)).toFixed(4)}
								<FontAwesomeIcon
									icon={['fab', 'ethereum']}
									style={{
										marginLeft: '4px',
									}}
								/>
								{pendingTxs > 0 && (
									<>
										{' '}
										<FontAwesomeIcon
											icon="angle-double-right"
											style={{
												margin: '0 4px',
												color: '#b07a6e',
											}}
										/>{' '}
										<SpinnerLoader />
										<span style={{ marginLeft: '5px' }}>{pendingTxs}</span>
									</>
								)}
							</>
						}
						border={true}
					/>
				)}
			</StyledAccountButton>

			<MobileAccountButton>
				{!account ? (
					<Button
						onClick={handleUnlockClick}
						size="sm"
						text={
							<>
								Connect Wallet{' '}
								<FontAwesomeIcon
									icon="link"
									style={{
										marginLeft: '4px',
									}}
								/>
							</>
						}
						border={true}
					/>
				) : (
					<Button
						onClick={onPresentAccountModal}
						size="sm"
						text={
							<>
								{account.slice(0, 6)}...
								{account.slice(account.length - 4, account.length)}
							</>
						}
						border={true}
					/>
				)}
			</MobileAccountButton>
		</>
	)
}

const StyledAccountButton = styled.div`
	@media (max-width: ${(props) => props.theme.breakpoints.mobile}px) {
		display: none;
	}
`

const MobileAccountButton = styled.div`
	@media (min-width: ${(props) => props.theme.breakpoints.mobile}px) {
		display: none;
	}
`

export default AccountButton
