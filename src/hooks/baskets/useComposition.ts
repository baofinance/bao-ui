import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useBao from 'hooks/base/useBao'
import useGeckoPrices from './useGeckoPrices'
import MultiCall from 'utils/multicall'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import { decimate } from '../../utils/numberFormat'
import useBasketInfo from './useBasketInfo'
import useBasketRates from './useNestRate'

export type BasketComponent = {
  address: string
  symbol: string
  name: string
  decimals: number
  price: BigNumber
  image: any
  balance: BigNumber
  percentage: number
  color: string
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
  const info = useBasketInfo(basket)
  const rates = useBasketRates(basket)
  const bao = useBao()

  const fetchComposition = useCallback(async () => {
    const tokenComposition: string[] = await basket.basketContract.methods
      .getTokens()
      .call()
    const lendingRegistry = bao.getContract('lendingRegistry')

    const marketCap = decimate(info.totalSupply.times(rates.usd), 36)

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
            { method: 'balanceOf', params: [basket.address] },
          ],
        })),
    )
    const tokenInfo = MultiCall.parseCallResults(
      await bao.multicall.call(tokensQuery),
    )

    const _comp: BasketComponent[] = []
    for (let i = 0; i < tokenComposition.length; i++) {
      const _c: any = tokenInfo[tokenComposition[i]]
        ? {
            decimals: tokenInfo[tokenComposition[i]][0].values[0],
            symbol: tokenInfo[tokenComposition[i]][1].values[0],
            name: tokenInfo[tokenComposition[i]][2].values[0],
            balance: new BigNumber(
              tokenInfo[tokenComposition[i]][3].values[0].hex,
            ),
          }
        : {
            // I don't like this, but MKR doesn't fit the mold.
            decimals: 18,
            symbol: 'MKR',
            name: 'Maker DAO',
            balance: await bao
              .getNewContract(
                'erc20.json',
                '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
              )
              .methods.balanceOf(basket.address)
              .call(),
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
          .methods.exchangeRate(_c.address)
          .call()
        const underlyingDecimals = await bao
          .getNewContract('erc20.json', lendingRes[0].values[0])
          .methods.decimals()
          .call()

        // Set extra values for lent tokens
        _c.underlying = lendingRes[0].values[0]
        _c.underlyingPrice = prices[_c.underlying.toLowerCase()]
        _c.strategy = _getStrategy(lendingRes[1].values[0])
        _c.price = decimate(
          prices[_c.underlying.toLowerCase()].times(exchangeRate),
        )

        // Adjust price for compound's exchange rate.
        // wrapped balance * exchange rate / 10 ** (18 - 8 + underlyingDecimals)
        // Here, the price is already decimated by 1e18, so we can subtract 8
        // from the underlying token's decimals.
        if (_c.strategy === 'Compound')
          _c.price /= 10 ** (underlyingDecimals - 8)
      }

      _comp.push({
        ..._c,
        image: require(`assets/img/assets/${_getImageURL(_c.symbol)}.png`),
        color: basket.pieColors[_c.symbol],
      })
    }

    for (let i = 0; i < _comp.length; i++) {
      const comp = _comp[i]

      _comp[i].percentage = new BigNumber(comp.balance)
        .div(10 ** comp.decimals)
        .times(comp.price)
        .div(marketCap)
        .times(100)
        .toNumber()
    }

    setComposition(_comp)
  }, [bao, basket, info, rates, prices])

  useEffect(() => {
    if (
      !(
        bao &&
        basket &&
        basket.basketContract &&
        basket.pieColors &&
        info &&
        rates &&
        prices &&
        Object.keys(prices).length > 0
      )
    )
      return

    fetchComposition()
  }, [bao, basket, info, rates, prices])

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
