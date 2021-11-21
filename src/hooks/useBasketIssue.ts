import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import Config from '../bao/lib/config'
import { getRecipeContract, basketIssue } from '../bao/utils'
import useBao from './useBao'

const useBasketIssue = (basketContractAddress: string) => {
  const { account } = useWallet()
  const bao = useBao()
  const recipeContract = getRecipeContract(bao)

  const handleIssue = useCallback(
    (amountWeth: BigNumber, encodedAmountData: string) =>
      basketIssue(
        recipeContract,
        basketContractAddress,
        Config.addressMap.WETH,
        amountWeth,
        encodedAmountData,
        account,
      ),
    [account, basketContractAddress, bao],
  )

  return { onIssue: handleIssue }
}

export default useBasketIssue
