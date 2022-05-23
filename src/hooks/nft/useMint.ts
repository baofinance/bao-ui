import { useWeb3React } from '@web3-react/core'
import {
  getBaoSwapContract,
  getElderContract,
  getNFTWhitelistClaimed,
} from 'bao/utils'
import useBao from 'hooks/base/useBao'
import useTransactionProvider from 'hooks/base/useTransactionProvider'
import { useCallback, useEffect, useState } from 'react'

export const useElderClaimedCheck = () => {
  const [isClaimed, setIsClaimed] = useState<any | undefined>()
  const { account } = useWeb3React()
  const bao = useBao()
  const { transactions } = useTransactionProvider()

  const fetchWhitelistClaimed = useCallback(async () => {
    const _isClaimed = await getNFTWhitelistClaimed(
      getElderContract(bao),
      account,
    )
    setIsClaimed(_isClaimed)
  }, [bao, account])

  useEffect(() => {
    if (account && bao) {
      fetchWhitelistClaimed()
    }
  }, [bao, account, transactions])

  return isClaimed
}

export const useBaoSwapClaimedCheck = () => {
  const [isClaimed, setIsClaimed] = useState<any | undefined>()
  const { account } = useWeb3React()
  const bao = useBao()
  const { transactions } = useTransactionProvider()

  const fetchWhitelistClaimed = useCallback(async () => {
    const _isClaimed = await getNFTWhitelistClaimed(
      getBaoSwapContract(bao),
      account,
    )
    setIsClaimed(_isClaimed)
  }, [bao, account])

  useEffect(() => {
    if (account && bao) {
      fetchWhitelistClaimed()
    }
  }, [bao, account, transactions])

  return isClaimed
}
