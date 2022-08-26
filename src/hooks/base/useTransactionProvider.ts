import { useContext } from 'react'

import { Context } from '@/contexts/Transactions'

const useTransactionProvider = () => useContext(Context)

export default useTransactionProvider
