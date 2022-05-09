import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useBao from 'hooks/base/useBao'
import useGeckoPrices from './useGeckoPrices'
import MultiCall from 'utils/multicall'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import { decimate } from '../../utils/numberFormat'

type BasketComponent = {
  address: string
  symbol: string
  name: string
  decimals: number
  price: BigNumber
  image: any
  underlying?: string
  underlyingPrice?: BigNumber
  strategy?: string
}

const useComposition = (
  basket: ActiveSupportedBasket,
): Array<BasketComponent> => {
  const [composition, setComposition] = useState<
    Array<BasketComponent> | undefined
  >()
  const prices = useGeckoPrices()
  const bao = useBao()

  const fetchComposition = useCallback(async () => {
    const tokenComposition: string[] = await basket.basketContract.methods
      .getTokens()
      .call()
    const lendingRegistry = bao.getContract('lendingRegistry')

    const tokensQuery = MultiCall.createCallContext(
      tokenComposition
        .filter(
          (token) =>
            token.toLowerCase() !==
            '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // Filter MKR because its symbol/name is a bytes32 object >_>
        )
        .map((address) => ({
          contract: bao.getNewContract('erc20.json', address),
          ref: address,
          calls: [
            { method: 'decimals' },
            { method: 'symbol' },
            { method: 'name' },
          ],
        })),
    )
    const tokenInfo = MultiCall.parseCallResults(
      await bao.multicall.call(tokensQuery),
    )

    const _comp: BasketComponent[] = []
    for (let i = 0; i < tokenComposition.length; i++) {
      // I don't like this, but MKR doesn't fit the mold.
      const _c: any = tokenInfo[tokenComposition[i]]
        ? {
            decimals: tokenInfo[tokenComposition[i]][0].values[0],
            symbol: tokenInfo[tokenComposition[i]][1].values[0],
            name: tokenInfo[tokenComposition[i]][2].values[0],
          }
        : {
            decimals: 18,
            symbol: 'MKR',
            name: 'Maker DAO',
          }
      _c.address = tokenComposition[i]
      _c.price = prices[tokenComposition[i].toLowerCase()]

      // Check if component is lent out. If the coin gecko prices array doesn't conclude it,
      // the current component is a wrapped interest bearing token.
      if (!Object.keys(prices).includes(_c.address.toLowerCase())) {
        // Get the underlying token's address as well as the lending protocol identifer
        const lendingQuery = MultiCall.createCallContext([
          {
            contract: lendingRegistry,
            ref: 'lendingRegistry',
            calls: [
              { method: 'wrappedToUnderlying', params: [_c.address] },
              { method: 'wrappedToProtocol', params: [_c.address] },
            ],
          },
        ])
        const { lendingRegistry: lendingRes } = MultiCall.parseCallResults(
          await bao.multicall.call(lendingQuery),
        )

        // Get Exchange Rate
        const logicAddress = await lendingRegistry.methods
          .protocolToLogic(lendingRes[1].values[0])
          .call()
        const exchangeRate = await bao
          .getNewContract('lendingLogicKashi.json', logicAddress)
          .methods.exchangeRateView(_c.address)
          .call()

        // Set extra values for lent tokens
        _c.underlying = lendingRes[0].values[0]
        _c.underlyingPrice = prices[_c.underlying.toLowerCase()]
        _c.price = decimate(
          prices[_c.underlying.toLowerCase()].times(exchangeRate),
        )
        _c.strategy = _getStrategy(lendingRes[1].values[0])
      }

      _comp.push({
        ..._c,
        image: require(`assets/img/assets/${_getImageURL(_c.symbol)}.png`),
      })
    }

    setComposition(_comp)
  }, [bao, basket, prices])

  useEffect(() => {
    if (
      !(
        basket &&
        basket.basketContract &&
        basket.pieColors &&
        prices &&
        Object.keys(prices).length > 0
      )
    )
      return

    fetchComposition()
  }, [bao, basket, prices])

  return composition
}

// Strategies represented in the Lending Registry contract as bytes32 objects.
const _getStrategy = (symbol: string) =>
  symbol.endsWith('1')
    ? 'Compound'
    : symbol.endsWith('2')
    ? 'AAVE'
    : symbol.endsWith('3')
    ? 'Sushi Bar'
    : 'Unknown'

// Special cases for image URLS, i.e. wrapped assets
// This sucks. Should figure a better way to do it.
const _getImageURL = (symbol: string) =>
  symbol.toLowerCase() === 'wmatic'
    ? 'MATIC'
    : symbol.toLowerCase() === 'sklima'
    ? 'KLIMA'
    : symbol.toLowerCase() === 'ayfi'
    ? 'YFI'
    : symbol.toLowerCase() === 'ccomp'
    ? 'COMP'
    : symbol.toLowerCase() === 'xsushi'
    ? 'SUSHI'
    : symbol.toLowerCase() === 'acrv'
    ? 'CRV'
    : symbol.toLowerCase() === 'arai'
    ? 'RAI'
    : symbol.toLowerCase() === 'afrax'
    ? 'FRAX'
    : symbol.toLowerCase() === 'afei'
    ? 'FEI'
    : symbol.toLowerCase() === 'cdai'
    ? 'DAI'
    : symbol

export default useComposition
