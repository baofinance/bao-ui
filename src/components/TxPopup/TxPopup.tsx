import { useWeb3React } from '@web3-react/core'
import 'animate.css/animate.min.css'
import React, { useEffect, useState } from 'react'
import { ReactNotifications, Store as NotifStore } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import usePendingTransactions from '../../hooks/base/usePendingTransactions'
import { isSuccessfulTransaction, waitTransaction } from './waitTransaction'

const TxPopup: React.FC = () => {
	const pendingTxs = usePendingTransactions()
	const [seenTxs, setSeenTxs] = useState({})
	const { library } = useWeb3React()

	useEffect(() => {
		setSeenTxs((stxs: any) => {
			pendingTxs.map(tx => {
				if (!stxs[tx.hash]) {
					waitTransaction(library, tx.hash).then(receipt => {
						const success = isSuccessfulTransaction(receipt)
						const successText = success ? 'Successful' : 'Failed'
						NotifStore.addNotification({
							title: `Transaction ${successText}`,
							message: (
								<>
									{tx.description} --{' '}
									<a
										target='_blank'
										rel='noreferrer'
										href={`https://etherscan.io/tx/${receipt.transactionHash}`}
										className='text-blue-600 hover:text-blue-800 underline visited:text-purple-600'
									>
										{tx.hash.slice(0, 6)}...{tx.hash.slice(-9, -1)}
									</a>
								</>
							),
							type: success ? 'success' : 'danger',
							insert: 'top',
							container: 'bottom-right',
							animationIn: ['animate__animated', 'animate__fadeIn'],
							animationOut: ['animate__animated', 'animate__fadeOut'],
							dismiss: {
								pauseOnHover: true,
								duration: 7000,
								onScreen: true,
								click: false, // so one can click the etherscan link
								touch: false, // so one can click the etherscan link
							},
						})
					})
				}
				stxs[tx.hash] = true
			})
			return stxs
		})
	}, [pendingTxs, setSeenTxs, library])

	return <ReactNotifications />
}

export default TxPopup
