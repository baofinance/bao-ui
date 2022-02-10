import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { getBalance } from 'utils/erc20'
import { provider } from 'web3-core'
import useBao from './useBao'
import useTransactionProvider from './useTransactionProvider'

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, ethereum }: { account: string; ethereum: provider } =
    useWallet()
  const bao = useBao()
  const { transactions } = useTransactionProvider()

  const fetchBalance = useCallback(async () => {
    if (tokenAddress === 'ETH') {
      const ethBalance = await bao.web3.eth.getBalance(account)
      return setBalance(new BigNumber(ethBalance))
    }

    const balance = await getBalance(ethereum, tokenAddress, account)
    setBalance(new BigNumber(balance))
  }, [transactions, account, ethereum, tokenAddress])

  useEffect(() => {
    if (account && ethereum && tokenAddress) {
      fetchBalance()
    }
  }, [transactions, account, ethereum, setBalance, tokenAddress])

  return balance
}

export default useTokenBalance
