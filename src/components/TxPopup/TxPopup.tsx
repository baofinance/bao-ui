import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useEffect } from 'react'
import { TransactionReceipt } from 'web3-core'
import { useWeb3React } from '@web3-react/core'
import Web3 from 'web3'
import usePendingTransactions from '../../hooks/base/usePendingTransactions'
import { waitTransaction, isSuccessfulTransaction } from './waitTransaction'

interface PopupProps {
	description?: any
	receipt: TransactionReceipt
}

const Popup: React.FC<PopupProps> = ({ description, receipt }) => {
	const hash = receipt.transactionHash
	const success = isSuccessfulTransaction(receipt)
	const successText = success ? 'Succeeded' : 'Failed'
	return (
		<div className='bg-white shadow-lg mx-auto w-96 max-w-full text-sm pointer-events-auto bg-clip-padding rounded-lg block'
			id='static-example' role='alert' aria-live='assertive' aria-atomic='true' data-mdb-autohide='false'>
			<div className='bg-white flex justify-between items-center py-2 px-3 bg-clip-padding border-b border-gray-200 rounded-t-lg'>
				<p className='font-bold text-gray-500'>Transaction {successText}</p>
				<div className='flex items-center'>
					<p className='text-xs text-green'>
						<FontAwesomeIcon icon={faCheck} size='2x' />
					</p>
				</div>
			</div>
			<div className='p-3 bg-white rounded-b-lg break-words text-gray-700'>
				{description}
				{' - '}
				<a target='_blank' className='underline text-blue-600 hover:text-blue-800 visited:text-purple-600'
					href={`https://etherscan.io/tx/${receipt.transactionHash}`}>
				 {hash.slice(0,6)}...{hash.slice(-9,-1)} 
				</a>
			</div>
		</div>
	)
}


interface TxPopupProps {
	children?: any
}

interface TxForPopup {
	hash: string
	description: string
	receipt: TransactionReceipt
}

const TxPopup: React.FC<TxPopupProps> = ({ children }) => {
	const pendingTxs = usePendingTransactions()
	const [seenTxs, setSeenTxs] = useState({})
	const [popups, setPopups] = useState([])
	const { library } = useWeb3React()

	useEffect(() => {
		const web3 = new Web3(library)
		setSeenTxs((txs: any) => {
			pendingTxs.map(tx => {
				if (!txs[tx.hash]) {
					waitTransaction(web3, tx.hash).then(receipt => {
						console.log('got receipt, adding popup for', tx.hash)
						setPopups(pps => {
							const popupTx: TxForPopup = {
								hash: tx.hash,
								description: tx.description,
								receipt,
							}
							pps.push(popupTx)
							return pps
						})
						setTimeout(() => {
							console.log('popup time over, removing popup for', tx.hash)
							setPopups(pps => pps.filter(p => p.hash !== tx.hash))
						}, 10000)
					})
				}
				txs[tx.hash] = true
			})
			return txs
		})
	}, [pendingTxs, setSeenTxs, setPopups, library])

	return (
		<div className='fixed flex items-center justify-center bottom-[0] w-[100%] pb-10'>
			<div className='flex justify-center space-x-2'>
				{popups.map((tx, i) => (
					<Popup key={i} description={tx.description} receipt={tx.receipt} />
				))}
			</div>
		</div>
	)
}

export default TxPopup
export type { TxPopupProps }
