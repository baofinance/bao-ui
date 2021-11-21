import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { getBasketContract, basketRedeem } from '../bao/utils'
import useBao from './useBao'
import { exponentiate } from '../utils/numberFormat'

const useBasketRedeem = (nid: number, redeemToWeth = true) => {
  const { account } = useWallet()
  const bao = useBao()
  const basketContract = getBasketContract(bao, nid)

  const handleBasketRedeem = useCallback(
    (amount: string) => {
      return redeemToWeth
        ? bao
            .getContract('basketRedeem')
            .methods.redeemBasketToWeth(
              basketContract.options.address,
              exponentiate(amount).toString()
            )
            .send({ from: account })
        : basketRedeem(basketContract, amount, account)
    },
    [account, nid, bao, redeemToWeth],
  )

  return { onBasketRedeem: handleBasketRedeem }
}

export default useBasketRedeem
