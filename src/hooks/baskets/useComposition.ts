import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import BN from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'

import useBao from '@/hooks/base/useBao'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import MultiCall from '@/utils/multicall'
import { decimate } from '@/utils/numberFormat'
import Config from '@/bao/lib/config'
import { Mkr__factory } from '@/typechain/factories'
import { Experipie__factory } from '@/typechain/factories'
import { LendingRegistry__factory } from '@/typechain/factories'
import { LendingLogicKashi__factory } from '@/typechain/factories'
import { Erc20__factory } from '@/typechain/factories'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import { fetchSushiApy } from './strategies/useSushiBarApy'
import useGeckoPrices from './useGeckoPrices'

export type BasketComponent = {
	address: string
	symbol: string
	name: string
	decimals: number
	price: BN
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
	const { library, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()

	const fetchComposition = useCallback(async () => {
		const basketContract = Experipie__factory.connect(basket.address, library)
		const lendingRegistry = LendingRegistry__factory.connect(Config.contracts.lendingRegistry[chainId].address, library)
		const mkr = Mkr__factory.connect(Config.addressMap.MKR, library)

		const tokenComposition: string[] = await basketContract.getTokens()
		const tokensQuery = MultiCall.createCallContext(
			tokenComposition
				.filter(
					token => token.toLowerCase() !== '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // Filter MKR because its symbol/name is a bytes32 object >_>
				)
				.map(address => ({
					contract: Erc20__factory.connect(address, library),
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
						balance: tokenInfo[tokenComposition[i]][3].values[0],
				  }
				: {
						decimals: await mkr.decimals(),
						symbol: 'MKR', // MKR token uses bytes32 for this
						name: 'Maker DAO', // MKR token uses bytes32 for this
						balance: await mkr.balanceOf(basket.address),
				  }
			_c.address = tokenComposition[i]

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

				//_c.price = prices[lendingRes[0].values[0].toLowerCase()]
				_c.underlying = lendingRes[0].values[0]
				_c.underlyingPrice = prices[_c.underlying.toLowerCase()]
				_c.strategy = _getStrategy(lendingRes[1].values[0])

				// Get Exchange Rate
				const logicAddress = await lendingRegistry.protocolToLogic(lendingRes[1].values[0])
				//const logicContract = bao.getNewContract(logicAddress, 'lendingLogicKashi.json')
				const logicContract = LendingLogicKashi__factory.connect(logicAddress, library)
				const exchangeRate = await logicContract.callStatic.exchangeRate(_c.address)
				// xSushi APY can't be found on-chain, check for special case
				const apy = _c.strategy === 'Sushi Bar' ? await fetchSushiApy() : await logicContract.getAPRFromUnderlying(lendingRes[0].values[0])
				const underlyingToken = Erc20__factory.connect(lendingRes[0].values[0], library)
				const underlyingDecimals = await underlyingToken.decimals()

				_c.price = new BN(exchangeRate.toString()).times(new BN(prices[_c.underlying.toLowerCase()].toString()))
				_c.apy = apy

				// Adjust price for compound's exchange rate.
				// wrapped balance * exchange rate / 10 ** (18 - 8 + underlyingDecimals)
				// Here, the price is already decimated by 1e18, so we can subtract 8
				// from the underlying token's decimals.
				if (_c.strategy === 'Compound') _c.price = decimate(_c.price, underlyingDecimals - 8)
				console.log(_c.price.toString())
			}

			_comp.push({
				..._c,
				image: `/images/tokens/${_getImageURL(_c.symbol)}.png`,
				color: basket.pieColors[_c.symbol],
			})
		}

		const marketCap = _comp.reduce((prev, comp) => {
			return prev.add(decimate(comp.balance, comp.decimals).mul(comp.price.toString()))
		}, BigNumber.from(0))

		// Assign allocation percentages
		for (let i = 0; i < _comp.length; i++) {
			const comp = _comp[i]

			_comp[i].percentage = new BN(comp.balance.toString())
				.times(comp.price.toString())
				.div(marketCap.toString())
				.times(100)
				.div(10 ** comp.decimals)
				.toNumber()
		}

		setComposition(_comp)
	}, [library, chainId, basket, prices, bao])

	useEffect(() => {
		if (!(library && chainId && basket && basket.basketContract && basket.pieColors && prices && Object.keys(prices).length > 0)) {
			return
		}
		console.log(library, chainId)

		fetchComposition()
	}, [library, chainId, basket, prices, transactions, fetchComposition])

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
