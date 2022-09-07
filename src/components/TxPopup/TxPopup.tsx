import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import { TransactionReceipt } from 'web3-core'
import useTransactionProvider from '../../hooks/base/useTransactionProvider'
import usePendingTransactions from '../../hooks/base/usePendingTransactions'


interface PopupProps {
	description?: any
	receipt: TransactionReceipt
}

const Popup: React.FC<PopupProps> = ({description, receipt}) => {
	console.log(description, receipt)
	return (
		<div className='bg-white shadow-lg mx-auto w-96 max-w-full text-sm pointer-events-auto bg-clip-padding rounded-lg block'
			id='static-example' role='alert' aria-live='assertive' aria-atomic='true' data-mdb-autohide='false'>
			<div className='bg-white flex justify-between items-center py-2 px-3 bg-clip-padding border-b border-gray-200 rounded-t-lg'>
				<p className='font-bold text-gray-500'>Transaction Succeeded</p>
				<div className='flex items-center'>
					<p className='text-gray-600 text-xs'>11 mins ago</p>
				</div>
			</div>
			<div className='p-3 bg-white rounded-b-lg break-words text-gray-700'>
				{description}
			</div>
		</div>
	)
}


interface TxPopupProps {
	children?: any
	className?: any
}

const TxPopup: React.FC<TxPopupProps> = ({ children, content, className }) => {
	const pendingTxs = usePendingTransactions()
	const { transactions } = useTransactionProvider()
	const [seenTxs, setSeenTxs] = useState({})
	const [popups, setPopups] = useState([])

	useEffect(() => {
		setSeenTxs((txs: any) => {
			pendingTxs.map(tx => {
				if (!txs[tx.hash]) {
					console.log('adding popup for', tx.hash)
					setPopups(pps => {
						pps.push(tx)
						return pps
					})
					setTimeout(() => {
						setPopups(pps => pps.filter(p => p.hash !== tx.hash))
					}, 10000)
				}
				txs[tx.hash] = true
			})
			return txs
		})
	}, [pendingTxs, setSeenTxs, setPopups])

	//console.log(popups)

	return (
		<div className='fixed flex items-center justify-center bottom-[0] w-[100%] pb-10'>
			<div className={cn(['flex', 'justify-center', 'space-x-2', className])}>
				{popups.map((tx, i) => {
					console.log(tx)
					return <Popup key={i} description={tx.description} />
				})}
			</div>
		</div>
	)
}

export default TxPopup
export type { TxPopupProps }
