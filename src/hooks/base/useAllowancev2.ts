import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import useBao from './useBao'
import { getAllowance } from 'utils/erc20'
import { BigNumber } from 'bignumber.js'

const useAllowancev2 = (
  tokenAddress: string,
  spenderAddress: string,
  updateParams: any[] = [],
) => {
  const { account }: { account: string; ethereum: provider } = useWallet()
  const bao = useBao()

  const [allowance, setAllowance] = useState<BigNumber | undefined>()

  updateParams.push(account, tokenAddress, spenderAddress)
  const _getAllowance: any = useCallback(async () => {
    try {
      const tokenContract = bao.getNewContract('erc20.json', tokenAddress)
      const _allowance = await getAllowance(
        tokenContract,
        account,
        spenderAddress,
      )
      setAllowance(new BigNumber(_allowance))
    } catch (e) {
      setAllowance(new BigNumber(0))
    }
  }, updateParams)

  useEffect(() => {
    _getAllowance()
  }, updateParams)

  return allowance
}

export default useAllowancev2
