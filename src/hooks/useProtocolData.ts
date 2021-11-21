import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { AbiItem } from 'web3-utils'
import experipieAbi from '../bao/lib/abi/experipie.json'
import Config from '../bao/lib/config'
import GraphUtil from '../utils/graph'
import MultiCall from '../utils/multicall'
import { getBalanceNumber, truncateNumber } from '../utils/numberFormat'
import useAllFarmTVL from './useAllFarmTVL'
import useBao from './useBao'

const useProtocolData = () => {
  const [analytics, setAnalytics] = useState<
    | Array<{
        title: string
        data: any
      }>
    | undefined
  >()

  const bao = useBao()
  const web3 = bao && bao.web3
  const multicall = bao && bao.multicall

  const farmTVL = useAllFarmTVL(web3, multicall)

  const fetchAnalytics = useCallback(async () => {
    if (!(farmTVL && bao)) return

    const ethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
    const multicallContext = []
    for (const basket of Config.baskets) {
      const basketAddress: any =
        (typeof basket.basketAddresses === 'string' && basket.basketAddresses) ||
        (basket.basketAddresses && basket.basketAddresses[Config.networkId]) ||
        basket.outputToken
      const basketContract = new web3.eth.Contract(
        experipieAbi as AbiItem[],
        basketAddress,
      )
      multicallContext.push({
        ref: basketAddress,
        contract: basketContract,
        calls: [{ method: 'decimals' }, { method: 'totalSupply' }],
      })
    }

    const results = MultiCall.parseCallResults(
      await multicall.call(MultiCall.createCallContext(multicallContext)),
    )
    let totalBasketUsd = new BigNumber(0)
    for (const basketAddress of Object.keys(results)) {
      const _price =
        (await GraphUtil.getPriceFromPair(ethPrice, basketAddress)) ||
        new BigNumber(0)
      const _supply = getBalanceNumber(
        new BigNumber(results[basketAddress][1].values[0].hex),
        results[basketAddress][0].values[0],
      )
      totalBasketUsd = totalBasketUsd.plus(_price.times(_supply).toNumber())
    }

    const baoSupply = await GraphUtil.getPollySupply()

    setAnalytics([
      {
        title: 'Bao Supply',
        data: truncateNumber(new BigNumber(baoSupply)),
      },
      {
        title: 'Baskets TVL',
        data: `$${truncateNumber(totalBasketUsd, 0)}`,
      },
      {
        title: 'Farms TVL',
        data: `$${truncateNumber(farmTVL.tvl, 0)}`,
      },
      {
        title: 'Bao Burned 🔥',
        data: truncateNumber(
          new BigNumber((await GraphUtil.getPollyBurned()).burnedTokens),
        ),
      },
    ])
  }, [farmTVL, bao])

  useEffect(() => {
    fetchAnalytics()
  }, [farmTVL, bao])

  return analytics
}

export default useProtocolData
