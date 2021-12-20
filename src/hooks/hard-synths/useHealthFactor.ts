import { useCallback, useEffect, useState } from 'react'
import { useAccountMarkets } from './useMarkets'
import { useAccountLiquidity } from './useAccountLiquidity'

const useHealthFactor = () => {
  const [healthFactor, setHealthFactor] = useState<number | undefined>()
  const markets = useAccountMarkets()
  const accountLiquidity = useAccountLiquidity()

  const fetchHealthFactor = useCallback(async () => {
    const { usdSupply, usdBorrow } = accountLiquidity
    const avgCollateralFactor =
      markets.reduce(
        (cfTotal, market) => cfTotal + market.collateralFactor,
        0,
      ) / markets.length
    setHealthFactor((usdSupply * avgCollateralFactor) / usdBorrow)
  }, [markets, accountLiquidity])

  useEffect(() => {
    if (!(markets && accountLiquidity)) return

    fetchHealthFactor()
  }, [markets, accountLiquidity])

  return healthFactor
}

export default useHealthFactor
