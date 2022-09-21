import { ethers } from 'ethers'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import { faAngleDoubleRight, faLink, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useMemo, useState } from 'react'
import { getDisplayBalance } from '@/utils/numberFormat'
//import { utils } from 'ethers'
import { isDesktop } from 'react-device-detect'

import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'

import AccountModal from '../AccountModal'
import Button from '../Button'
import Loader from '../Loader'
import WalletProviderModal from '../WalletProviderModal'

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = () => {
	const [showAccountModal, setShowAccountModal] = useState(false)
	const [showWalletProviderModal, setShowWalletProviderModal] = useState(false)
	const [ens, setEns] = useState<string | undefined>()

	const { transactions } = useTransactionProvider()
	const { account } = useWeb3React()
	const ethBalance = useTokenBalance('ETH')

	useEffect(() => {
		const ensResolver = new ethers.providers.JsonRpcProvider(`${process.env.NEXT_PUBLIC_ALCHEMY_API_URL}`)

		if (!account) return

		ensResolver.lookupAddress(account).then(_ens => {
			if (_ens) setEns(_ens)
		})
	}, [account])

	const pendingTxs = useMemo(() => Object.keys(transactions).filter(txHash => !transactions[txHash].receipt).length, [transactions])

	return (
		<>
			{isDesktop &&
				(!account ? (
					<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
						<>
							Connect <FontAwesomeIcon icon={faLink} className='ml-1' />
						</>
					</Button>
				) : (
					<Button onClick={() => setShowAccountModal(true)} size='sm'>
						<>
							<div className='items-center'>
								{ens ? (
									ens
								) : (
									<>
										{account.slice(0, 6)}...
										{account.slice(account.length - 4, account.length)}{' '}
									</>
								)}
								<FontAwesomeIcon icon={faAngleDoubleRight} className='mx-2 text-text-200' />
								{getDisplayBalance(ethBalance)}
								<FontAwesomeIcon icon={faEthereum} className='mx-1' />
								{pendingTxs > 0 && (
									<>
										<FontAwesomeIcon icon={faAngleDoubleRight} className='mx-2 -mt-1 text-text-200' />
										<Loader />
										<span className='ml-2'>{pendingTxs}</span>
										<FontAwesomeIcon icon={faReceipt} className='mx-2 -mt-1 text-text-200' />
									</>
								)}
							</div>
						</>
					</Button>
				))}

			{!isDesktop &&
				(!account ? (
					<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
						{' '}
						<>
							Connect <FontAwesomeIcon icon={faLink} className='ml-4' />
						</>
					</Button>
				) : (
					<Button onClick={() => setShowAccountModal(true)} size='sm'>
						<>
							{account.slice(0, 6)}...
							{account.slice(account.length - 4, account.length)}
						</>
					</Button>
				))}

			<AccountModal show={showAccountModal} onHide={() => setShowAccountModal(false)} />

			<WalletProviderModal show={showWalletProviderModal} onHide={() => setShowWalletProviderModal(false)} />
		</>
	)
}

export default AccountButton
