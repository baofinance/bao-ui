import { useWeb3React } from '@web3-react/core'
import { getMasterChefContract, getStaked } from 'bao/utils'
import { BigNumber } from 'bignumber.js'
import useBlock from 'hooks/base/useBlock'
import useTransactionProvider from 'hooks/base/useTransactionProvider'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account } = useWeb3React()
  const bao = useBao()
  const masterChefContract = getMasterChefContract(bao)
  const { transactions } = useTransactionProvider()
  const block = useBlock()

  let userBalance

  const fetchBalance = useCallback(async () => {
    BigNumber.config({ DECIMAL_PLACES: 18 })
    const balance = await getStaked(masterChefContract, pid, account)
    userBalance = new BigNumber(balance)
    setBalance(userBalance.decimalPlaces(18))
  }, [account, pid, bao])

  useEffect(() => {
    if (account && bao) {
      fetchBalance()
    }
  }, [account, pid, setBalance, transactions, bao, block])

  return balance.decimalPlaces(18)
}

export default useStakedBalance
