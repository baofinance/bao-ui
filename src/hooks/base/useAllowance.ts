import { useWeb3React } from '@web3-react/core'
import Config from 'bao/lib/config'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { getAllowance } from 'utils/erc20'
import { Contract } from 'web3-eth-contract'
import useBlock from './useBlock'
import useTransactionProvider from './useTransactionProvider'

const useAllowance = (lpContract: Contract) => {
  const [allowance, setAllowance] = useState(new BigNumber(0))
  const { account } = useWeb3React()
  const { transactions } = useTransactionProvider()
  const block = useBlock()

  const fetchAllowance = useCallback(async () => {
    const allowance = await getAllowance(
      lpContract,
      account,
      Config.contracts.masterChef[Config.networkId].address,
    )
    setAllowance(new BigNumber(allowance))
  }, [account, lpContract])

  useEffect(() => {
    if (account && lpContract) {
      fetchAllowance()
    }
    const refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, lpContract, transactions, block])

  return allowance
}

export default useAllowance
