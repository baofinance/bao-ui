import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getBalance } from 'utils/erc20'
import useBao from './useBao'
import useTransactionProvider from './useTransactionProvider'

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account } = useWeb3React()
  const bao = useBao()
  const { transactions } = useTransactionProvider()

  const fetchBalance = useCallback(async () => {
    if (tokenAddress === 'ETH') {
      const ethBalance = await bao.web3.eth.getBalance(account)
      return setBalance(new BigNumber(ethBalance))
    }

    const balance = await getBalance(bao, tokenAddress, account)
    setBalance(new BigNumber(balance))
  }, [transactions, account, bao, tokenAddress])

  useEffect(() => {
    if (account && bao && tokenAddress) {
      fetchBalance()
    }
  }, [transactions, account, bao, setBalance, tokenAddress])

  return balance
}

export default useTokenBalance
