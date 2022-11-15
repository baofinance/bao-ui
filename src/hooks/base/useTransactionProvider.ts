import { useContext, useState, useRef, useEffect } from 'react'

import { Context as TransactionsContext } from '@/contexts/Transactions'

const useTransactionProvider = () => useContext(TransactionsContext)

export const useTxReceiptUpdater = (callback: (() => void) | (() => Promise<void>)) => {
	const [firstRender, setFirstRender] = useState<boolean>(true)
	const { transactions, loaded } = useTransactionProvider()
	const txNumberRef = useRef<number>(Object.keys(transactions).filter(tx => transactions[tx].receipt).length)
	useEffect(() => {
		setFirstRender(false)
		//console.log('first render off!')
	}, [setFirstRender])
	const txNumber = Object.keys(transactions).filter(tx => transactions[tx].receipt)
	if (txNumber.length !== txNumberRef.current) {
		txNumberRef.current = txNumber.length
		//console.log('update txNumber len')
		if (loaded && !firstRender) {
			//console.log('callback!')
			callback()
		}
	}
}

export default useTransactionProvider
