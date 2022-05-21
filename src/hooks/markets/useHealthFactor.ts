import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useAccountLiquidity } from './useAccountLiquidity'
import { useAccountMarkets } from './useMarkets'

const useHealthFactor = () => {
  const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>()
  const markets = useAccountMarkets()
  const accountLiquidity = useAccountLiquidity()

  const fetchHealthFactor = useCallback(async () => {
    const { usdSupply, usdBorrow } = accountLiquidity
    const _markets = markets.filter((market) => !market.isSynth)

    const avgCollateralFactor =
      _markets.reduce(
        (cfTotal, market) => cfTotal + market.collateralFactor,
        0,
      ) / _markets.length
      
    const _healthFactor = new BigNumber(
      (usdSupply * avgCollateralFactor) / usdBorrow,
    )
    setHealthFactor(_healthFactor.isNaN() ? new BigNumber(0) : _healthFactor)
  }, [markets, accountLiquidity])

  useEffect(() => {
    if (!(markets && accountLiquidity)) return

    fetchHealthFactor()
  }, [markets, accountLiquidity])

  return healthFactor
}

export default useHealthFactor
