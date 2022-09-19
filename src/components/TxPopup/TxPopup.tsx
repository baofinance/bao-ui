import 'animate.css/animate.min.css'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { ReactNotifications, Store as NotifStore } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import usePendingTransactions from '@/hooks/base/usePendingTransactions'
import useBao from '@/hooks/base/useBao'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { isSuccessfulTransaction, waitTransaction } from './waitTransaction'

type PopupTitleProps = {
	success: boolean
}

const PopupTitle: React.FC<PopupTitleProps> = ({ success }) => {
	const titleText = success ? 'Successful' : 'Failed'
	const color = success ? 'green' : 'red'
	const icon = success ? faCheck : faXmark
	return (
		<div className='flex items-center'>
			<div className='flex-1'>Transaction {titleText}</div>
			<div className={`text-${color}`}>
				<FontAwesomeIcon size='lg' icon={icon} />
			</div>
		</div>
	)
}

type PopupMessageProps = {
	description: string
	hash: string
}

const PopupMessage: React.FC<PopupMessageProps> = ({ description, hash }) => {
	return (
		<div className='TxPopup'>
			{description} —{' '}
			<a
				target='_blank'
				rel='noreferrer'
				href={`https://etherscan.io/tx/${hash}`}
				className='text-blue-600 hover:text-blue-800 underline visited:text-purple-600'
			>
				{hash.slice(0, 6)}...{hash.slice(-5, -1)}
			</a>
		</div>
	)
}

// FIXME: only render this in a web3reactcontext
const TxPopup: React.FC = () => {
	const pendingTxs = usePendingTransactions()
	const [seenTxs, setSeenTxs] = useState({})
	const { library } = useWeb3React()

	useEffect(() => {
		if (!library) { return }
		setSeenTxs((stxs: any) => {
			// This is a guard so that we do not have multiple popups for the same tx
			pendingTxs.map(tx => {
				if (!stxs[tx.hash]) {
					waitTransaction(library, tx.hash).then(receipt => {
						console.log(receipt)
						if (receipt === null) { return }
						const success = isSuccessfulTransaction(receipt)
						NotifStore.addNotification({
							title: <PopupTitle success={success} />,
							message: <PopupMessage description={tx.description} hash={tx.hash} />,
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
			// This is the end of the guard against multiple popups for the same tx
		})
	}, [pendingTxs, setSeenTxs, library])

	return <ReactNotifications />
}

export default TxPopup
