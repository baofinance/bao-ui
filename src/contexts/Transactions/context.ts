import { createContext } from 'react'
import { Transaction, TransactionReceipt, TransactionsMap } from './types'

interface TransactionsContext {
	transactions: TransactionsMap
	onAddTransaction: (tx: Transaction) => void
	onTxReceipt: (receipt: TransactionReceipt) => void
	onClearTransactions: () => void
}

export default createContext<TransactionsContext>({
	transactions: {},
	onAddTransaction: (tx: Transaction) => {},
	onTxReceipt: (receipt: TransactionReceipt) => {},
	onClearTransactions: () => {},
})
