import { Bao } from 'bao'
import erc20Abi from 'bao/lib/abi/erc20.json'
import lpAbi from 'bao/lib/abi/uni_v2_lp.json'
import Config from 'bao/lib/config'
import BigNumber from 'bignumber.js/bignumber'
import { Multicall as MC } from 'ethereum-multicall'
import { useCallback, useEffect, useState } from 'react'
import GraphUtil from 'utils/graph'
import Multicall from 'utils/multicall'
import { decimate } from 'utils/numberFormat'
import { AbiItem } from 'web3-utils'

export const fetchLPInfo = async (farms: any[], multicall: MC, bao: Bao) => {
  const results = Multicall.parseCallResults(
    await multicall.call(
      Multicall.createCallContext(
        farms.map((farm) =>
          farm.pid === 14 || farm.pid === 23 // single asset farms (TODO: make single asset a config field)
            ? ({
                ref: farm.lpAddresses[Config.networkId],
                contract: new bao.web3.eth.Contract(
                  erc20Abi as AbiItem[],
                  farm.lpAddresses[Config.networkId],
                ),
                calls: [
                  {
                    method: 'balanceOf',
                    params: [
                      Config.contracts.masterChef[Config.networkId].address,
                    ],
                  },
                  { method: 'totalSupply' },
                ],
              } as any)
            : ({
                ref: farm.lpAddresses[Config.networkId],
                contract: new bao.web3.eth.Contract(
                  lpAbi as AbiItem[],
                  farm.lpAddresses[Config.networkId],
                ),
                calls: [
                  { method: 'getReserves' },
                  { method: 'token0' },
                  { method: 'token1' },
                  {
                    method: 'balanceOf',
                    params: [
                      Config.contracts.masterChef[Config.networkId].address,
                    ],
                  },
                  { method: 'totalSupply' },
                ],
              } as any),
        ),
      ),
    ),
  )

  return Object.keys(results).map((key: any) => {
    const res0 = results[key]

    const reserves = [
      new BigNumber(res0[0].values[0].hex),
      new BigNumber(res0[0].values[1].hex),
    ]
    const token0Address = res0[1].values[0]
    const token1Address = res0[2].values[0]

    const tokens = [
      {
        address: token0Address,
        balance: decimate(reserves[0]),
      },
      {
        address: token1Address,
        balance: decimate(
          reserves[1],
          token1Address === Config.addressMap.USDC ? 6 : 18,
        ), // This sucks. Should consider token decimals rather than check manually. Luckily, we're getting rid of farms soon & there's only 3 left.
      },
    ]

    return {
      tokens,
      lpAddress: key,
      lpStaked: new BigNumber(res0[3].values[0].hex),
      lpSupply: new BigNumber(res0[4].values[0].hex),
    }
  })
}

const useAllFarmTVL = (bao: Bao, multicall: MC) => {
  const [tvl, setTvl] = useState<any | undefined>()

  const fetchAllFarmTVL = useCallback(async () => {
    const lps: any = await fetchLPInfo(Config.farms, multicall, bao)
    const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
    const tokenPrices = await GraphUtil.getPriceFromPairMultiple(wethPrice, [
      Config.addressMap.USDC,
    ])

    const tvls: any[] = []
    let _tvl = new BigNumber(0)
    lps.forEach((lpInfo: any) => {
      let lpStakedUSD
      if (lpInfo.singleAsset) {
        lpStakedUSD = decimate(lpInfo.lpStaked).times(
          Object.values(tokenPrices).find(
            (priceInfo) =>
              priceInfo.address.toLowerCase() ===
              lpInfo.lpAddress.toLowerCase(),
          ).price,
        )
        _tvl = _tvl.plus(lpStakedUSD)
      } else {
        let token, tokenPrice, specialPair
        if (
          lpInfo.tokens[0].address.toLowerCase() ===
            Config.addressMap.BAO.toLowerCase() &&
          lpInfo.tokens[1].address.toLowerCase() ===
            Config.addressMap.USDC.toLowerCase()
        ) {
          // BAO-USDC pair
          token = lpInfo.tokens[1]
          specialPair = true
        } else token = lpInfo.tokens[1]

        if (
          token.address.toLowerCase() === Config.addressMap.WETH.toLowerCase()
        )
          // *-wETH pair
          tokenPrice = wethPrice
        else if (
          token.address.toLowerCase() ===
            Config.addressMap.USDC.toLowerCase() &&
          specialPair
        )
          // BAO-nDEFI pair
          tokenPrice = Object.values(tokenPrices).find(
            (priceInfo) =>
              priceInfo.address.toLowerCase() ===
              Config.addressMap.USDC.toLowerCase(),
          ).price

        lpStakedUSD = token.balance
          .times(tokenPrice)
          .times(2)
          .times(lpInfo.lpStaked.div(lpInfo.lpSupply))
      }

      tvls.push({
        lpAddress: lpInfo.lpAddress,
        tvl: lpStakedUSD,
        lpStaked: lpInfo.lpStaked,
      })
      _tvl = _tvl.plus(lpStakedUSD)
    })
    setTvl({
      tvl: _tvl,
      tvls,
    })
  }, [bao, multicall])

  useEffect(() => {
    // Only fetch TVL once per page load
    if (!(bao && multicall) || tvl) return

    fetchAllFarmTVL()
  }, [bao, multicall])

  return tvl
}

export default useAllFarmTVL
