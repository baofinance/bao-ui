import { useState } from 'react'
import { TransactionReceipt } from '@ethersproject/providers'

import useTransactionProvider from './useTransactionProvider'

const useTransactionHandler = () => {
	const { onAddTransaction, onTxReceipt } = useTransactionProvider()
	const [pendingTx, setPendingTx] = useState<string | boolean>(false)
	const [txSuccess, setTxSuccess] = useState<boolean>(false)

	const clearPendingTx = () => {
		setPendingTx(false)
	}

	const handlePendingTx = (hash: string, description: string) => {
		onAddTransaction({
			hash,
			description,
		})
		setPendingTx(hash)
	}

	const handleReceipt = (receipt: TransactionReceipt) => {
		onTxReceipt(receipt)
		setPendingTx(false)
	}

	const handleTx = async (_tx: any, description: string, cb?: () => void) => {
		const tx = await _tx
		handlePendingTx(tx.hash, description)
		setPendingTx(true)
		const receipt = await tx.wait()
		handleReceipt(receipt)
		if (cb) cb()
		setTxSuccess(receipt.status === true)
	}

	return {
		pendingTx,
		handleTx,
		txSuccess,
	}
}

export default useTransactionHandler
