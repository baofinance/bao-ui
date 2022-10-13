import { useContext, useState, useRef, useEffect } from 'react'

import { Context } from '@/contexts/Transactions'

const useTransactionProvider = () => useContext(Context)

export const useTxReceiptUpdater = (callback: (() => void) | (() => Promise<void>)) => {
	const [firstRender, setFirstRender] = useState<boolean>(true)
	const { transactions } = useTransactionProvider()
	const txNumberRef = useRef<number>(0)
	useEffect(() => {
		setFirstRender(false)
	}, [setFirstRender])
	const txNumber = Object.keys(transactions).filter(tx => transactions[tx].receipt)
	if (txNumber.length !== txNumberRef.current) {
		txNumberRef.current = txNumber.length
		if (!firstRender) callback()
	}
}

export default useTransactionProvider
