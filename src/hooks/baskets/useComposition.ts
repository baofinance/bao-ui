import BigNumber from 'bignumber.js'
import useBao from 'hooks/base/useBao'
import useTransactionProvider from 'hooks/base/useTransactionProvider'
import { useCallback, useEffect, useState } from 'react'
import MultiCall from 'utils/multicall'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import { decimate } from '../../utils/numberFormat'
import { fetchSushiApy } from './strategies/useSushiBarApy'
import useGeckoPrices from './useGeckoPrices'

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
	apy?: BigNumber
}

const useComposition = (basket: ActiveSupportedBasket): Array<BasketComponent> => {
	const [composition, setComposition] = useState<Array<BasketComponent> | undefined>()
	const prices = useGeckoPrices()
	const bao = useBao()
	const { transactions } = useTransactionProvider()

	const fetchComposition = useCallback(async () => {
		const tokenComposition: string[] = await basket.basketContract.methods.getTokens().call()
		const lendingRegistry = bao.getContract('lendingRegistry')

		const tokensQuery = MultiCall.createCallContext(
			tokenComposition
				.filter(
					token => token.toLowerCase() !== '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // Filter MKR because its symbol/name is a bytes32 object >_>
				)
				.map(address => ({
					contract: bao.getNewContract('erc20.json', address),
					ref: address,
					calls: [{ method: 'decimals' }, { method: 'symbol' }, { method: 'name' }, { method: 'balanceOf', params: [basket.address] }],
				})),
		)
		const tokenInfo = MultiCall.parseCallResults(await bao.multicall.call(tokensQuery))

		const _comp: BasketComponent[] = []
		for (let i = 0; i < tokenComposition.length; i++) {
			const _c: any = tokenInfo[tokenComposition[i]]
				? {
						decimals: tokenInfo[tokenComposition[i]][0].values[0],
						symbol: tokenInfo[tokenComposition[i]][1].values[0],
						name: tokenInfo[tokenComposition[i]][2].values[0],
						balance: new BigNumber(tokenInfo[tokenComposition[i]][3].values[0].hex),
				  }
				: {
						// I don't like this, but MKR doesn't fit the mold.
						decimals: 18,
						symbol: 'MKR',
						name: 'Maker DAO',
						balance: new BigNumber(
							await bao.getNewContract('erc20.json', '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2').methods.balanceOf(basket.address).call(),
						),
				  }
			_c.address = tokenComposition[i]
			_c.price = new BigNumber(prices[tokenComposition[i].toLowerCase()])

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
				const { lendingRegistry: lendingRes } = MultiCall.parseCallResults(await bao.multicall.call(lendingQuery))

				_c.underlying = lendingRes[0].values[0]
				_c.underlyingPrice = prices[_c.underlying.toLowerCase()]
				_c.strategy = _getStrategy(lendingRes[1].values[0])

				// Get Exchange Rate
				const logicAddress = await lendingRegistry.methods.protocolToLogic(lendingRes[1].values[0]).call()
				const logicContract = bao.getNewContract('lendingLogicKashi.json', logicAddress)
				const exchangeRate = await logicContract.methods.exchangeRate(_c.address).call()
				// xSushi APY can't be found on-chain, check for special case
				const apy =
					_c.strategy === 'Sushi Bar'
						? await fetchSushiApy()
						: new BigNumber(await logicContract.methods.getAPRFromUnderlying(lendingRes[0].values[0]).call())
				const underlyingDecimals = await bao.getNewContract('erc20.json', lendingRes[0].values[0]).methods.decimals().call()

				_c.price = decimate(prices[_c.underlying.toLowerCase()].times(exchangeRate))
				_c.apy = apy

				// Adjust price for compound's exchange rate.
				// wrapped balance * exchange rate / 10 ** (18 - 8 + underlyingDecimals)
				// Here, the price is already decimated by 1e18, so we can subtract 8
				// from the underlying token's decimals.
				if (_c.strategy === 'Compound') _c.price = decimate(_c.price, underlyingDecimals - 8)
			}

			_comp.push({
				..._c,
				image: require(`assets/img/tokens/${_getImageURL(_c.symbol)}.png`).default,
				color: basket.pieColors[_c.symbol],
			})
		}

		const marketCap = _comp.reduce((prev, comp) => prev.plus(decimate(comp.balance, comp.decimals).times(comp.price)), new BigNumber(0))

		// Assign allocation percentages
		for (let i = 0; i < _comp.length; i++) {
			const comp = _comp[i]

			_comp[i].percentage = decimate(new BigNumber(comp.balance), comp.decimals).times(comp.price).div(marketCap).times(100).toNumber()
		}

		setComposition(_comp)
	}, [bao, basket, prices])

	useEffect(() => {
		if (!(bao && basket && basket.basketContract && basket.pieColors && prices && Object.keys(prices).length > 0)) return

		fetchComposition()
	}, [bao, basket, prices, transactions])

	return composition
}

// Strategies represented in the Lending Registry contract as bytes32 objects.
const _getStrategy = (symbol: string) =>
	symbol.endsWith('1') ? 'Compound' : symbol.endsWith('2') ? 'AAVE' : symbol.endsWith('3') ? 'Sushi Bar' : 'Unknown'

// Special cases for image URLS, i.e. wrapped assets
// This sucks. Should do this more dynamically.
const _getImageURL = (symbol: string) =>
	symbol.toLowerCase() === 'arai' ? 'RAI' : symbol.toLowerCase() === 'ausdc' ? 'USDC' : symbol.toLowerCase() === 'adai' ? 'DAI' : symbol

export default useComposition
