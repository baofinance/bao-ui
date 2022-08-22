import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { getBalanceNumber } from '@/utils/numberFormat'
import Button from '../../Button'
import Loader from '../../Loader'
import WalletProviderModal from '../../WalletProviderModal'
import AccountModal from './AccountModal'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = () => {
	const [showAccountModal, setShowAccountModal] = useState(false)
	const [showWalletProviderModal, setShowWalletProviderModal] = useState(false)
	const [ens, setEns] = useState<string | undefined>()

	const { transactions } = useTransactionProvider()
	const { account } = useWeb3React()
	const ethBalance = useTokenBalance('ETH')

	useEffect(() => {
		const ensResolver = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/UZ88g_fys9oP-NhI2S-O47r6isdCIGHI')

		if (!account) return

		ensResolver.lookupAddress(account).then(_ens => {
			if (_ens) setEns(_ens)
		})
	}, [account])

	const pendingTxs = useMemo(() => Object.keys(transactions).filter(txHash => !transactions[txHash].receipt).length, [transactions])

	return (
		<>
			<StyledAccountButton>
				{!account ? (
					<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
						<>
							Connect{' '}
							<FontAwesomeIcon
								icon={faLink}
								style={{
									marginLeft: '4px',
								}}
							/>
						</>
					</Button>
				) : (
					<Button onClick={() => setShowAccountModal(true)} size='sm'>
						<>
							{ens ? (
								ens
							) : (
								<>
									{account.slice(0, 6)}...
									{account.slice(account.length - 4, account.length)}{' '}
								</>
							)}
							<FontAwesomeIcon
								icon={faAngleDoubleRight}
								className='text-text-200 mx-2 my-0 -mt-1'
							/>
							{getBalanceNumber(ethBalance).toFixed(4)}
							<FontAwesomeIcon
								icon={faEthereum}
								className='mx-1 text-text-200'
							/>
							{pendingTxs > 0 && (
								<>
									<FontAwesomeIcon
										icon={faAngleDoubleRight}
										className='mx-0 my-1 text-text-200'
									/>
									<Loader />
									<span style={{ marginLeft: '5px' }}>{pendingTxs}</span>
								</>
							)}
						</>
					</Button>
				)}
			</StyledAccountButton>

			<MobileAccountButton>
				{!account ? (
					<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
						{' '}
						<>
							Connect{' '}
							<FontAwesomeIcon
								icon={faLink}
								style={{
									marginLeft: '4px',
								}}
							/>
						</>
					</Button>
				) : (
					<Button onClick={() => setShowAccountModal(true)} size='sm'>
						<>
							{account.slice(0, 6)}...
							{account.slice(account.length - 4, account.length)}
						</>
					</Button>
				)}
			</MobileAccountButton>

			<AccountModal show={showAccountModal} onHide={() => setShowAccountModal(false)} />

			<WalletProviderModal show={showWalletProviderModal} onHide={() => setShowWalletProviderModal(false)} />
		</>
	)
}

const StyledAccountButton = styled.div`
	@media (max-width: ${props => props.theme.breakpoints.sm}px) {
		display: none;
	}
`

const MobileAccountButton = styled.div`
	@media (min-width: ${props => props.theme.breakpoints.sm}px) {
		display: none;
	}
`

export default AccountButton
