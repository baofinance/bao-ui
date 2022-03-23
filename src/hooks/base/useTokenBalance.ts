import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getBalance } from 'utils/erc20'
import { provider } from 'web3-core'
import useBao from './useBao'
import useTransactionProvider from './useTransactionProvider'

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, library } = useWeb3React()
  const bao = useBao()
  const { transactions } = useTransactionProvider()

  const fetchBalance = useCallback(async () => {
    if (tokenAddress === 'ETH') {
      const ethBalance = await bao.web3.eth.getBalance(account)
      return setBalance(new BigNumber(ethBalance))
    }

    const balance = await getBalance(library, tokenAddress, account)
    setBalance(new BigNumber(balance))
  }, [transactions, account, library, tokenAddress])

  useEffect(() => {
    if (account && library && tokenAddress) {
      fetchBalance()
    }
  }, [transactions, account, library, setBalance, tokenAddress])

  return balance
}

export default useTokenBalance
