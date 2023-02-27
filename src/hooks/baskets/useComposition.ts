import Config from '@/bao/lib/config'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import { Erc20__factory, LendingLogicKashi__factory } from '@/typechain/factories'
import type { Experipie, LendingRegistry, Mkr } from '@/typechain/index'
import MultiCall from '@/utils/multicall'
import { decimate, exponentiate } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import fetchSushiApy from './strategies/useSushiBarApy'
import useGeckoPrices from './useGeckoPrices'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

export type BasketComponent = {
	address: string
	symbol: string
	name: string
	decimals: number
	price: BigNumber
	image: any
	balance: BigNumber
	percentage: BigNumber
	color: string
	underlying?: string
	underlyingPrice?: BigNumber
	strategy?: string
	apy?: BigNumber
}

const useComposition = (basket: ActiveSupportedBasket): Array<BasketComponent> => {
	const prices = useGeckoPrices()
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()

	const lendingRegistry = useContract<LendingRegistry>('LendingRegistry')
	const mkr = useContract<Mkr>('Mkr', Config.addressMap.MKR)
	const basketContract = useContract<Experipie>('Experipie', basket ? basket.address : null)

	const enabled = !!bao && !!lendingRegistry && !!mkr && !!basketContract && !!prices
	const { data: composition, refetch } = useQuery(
		['@/hooks/baskets/useComposition', providerKey(library, account, chainId), { enabled, nid: basket.nid }],
		async () => {
			const tokenComposition: string[] = await basketContract.getTokens()
			const tokensQuery = MultiCall.createCallContext(
				tokenComposition
					.filter(
						// INFO: filter MKR because its symbol/name is a bytes32 object >_> handle manually later
						token => token.toLowerCase() !== '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
					)
					.map(address => ({
						contract: Erc20__factory.connect(address, library),
						ref: address,
						calls: [{ method: 'decimals' }, { method: 'symbol' }, { method: 'name' }, { method: 'balanceOf', params: [basket.address] }],
					})),
			)
			const tokenInfo = MultiCall.parseCallResults(await bao.multicall.call(tokensQuery))

			console.log(tokenInfo)

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
							// INFO: this is where we handly MKR manually later as it its config is non-standard and funky
							decimals: await mkr.decimals(),
							symbol: 'MKR', // MKR token uses bytes32 for this
							name: 'Maker DAO', // MKR token uses bytes32 for this
							balance: await mkr.balanceOf(basket.address),
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
					const { lendingRegistry: lendingRes } = MultiCall.parseCallResults(await bao.multicall.call(lendingQuery))

					_c.underlying = lendingRes[0].values[0]
					_c.underlyingPrice = prices[_c.underlying.toLowerCase()]
					_c.strategy = _c.symbol === 'wstETH' ? 'Lido' : _c.symbol === 'rETH' ? 'Rocket Pool' : _getStrategy(lendingRes[1].values[0])

					// Get Exchange Rate
					const logicAddress = await lendingRegistry.protocolToLogic(lendingRes[1].values[0])
					const logicContract = LendingLogicKashi__factory.connect(logicAddress, library)
					const exchangeRate = await logicContract.callStatic.exchangeRate(_c.address)
					const underlyingToken = Erc20__factory.connect(lendingRes[0].values[0], library)
					const underlyingDecimals = await underlyingToken.decimals()

					_c.price = decimate(prices[_c.underlying.toLowerCase()].mul(exchangeRate))

					// xSushi APY can't be found on-chain, check for special case
					_c.apy = _c.strategy === 'Sushi Bar' ? await fetchSushiApy() : await logicContract.getAPRFromUnderlying(lendingRes[0].values[0])

					// Adjust price for compound's exchange rate.
					// wrapped balance * exchange rate / 10 ** (18 - 8 + underlyingDecimals)
					// Here, the price is already decimated by 1e18, so we can subtract 8
					// from the underlying token's decimals.
					if (_c.strategy === 'Compound') _c.price = decimate(_c.price, underlyingDecimals - 8)
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
				const percentage = comp.balance.mul(comp.price).div(marketCap).mul(100)
				_comp[i].percentage = decimate(exponentiate(percentage), _comp[i].decimals)
			}

			return _comp
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return composition
}

// Strategies represented in the Lending Registry contract as bytes32 objects.
const _getStrategy = (symbol: string) => {
	if (symbol.endsWith('1')) {
		return 'Compound'
	} else if (symbol.endsWith('2')) {
		return 'AAVE'
	} else if (symbol.endsWith('3')) {
		return 'Sushi Bar'
	} else {
		return 'Unknown'
	}
}

// Special cases for image URLS, i.e. wrapped assets
// This sucks. Should do this more dynamically.
const _getImageURL = (symbol: string) => {
	switch (symbol.toLowerCase()) {
		case 'asusd':
			return 'SUSD'
		case 'ausdc':
			return 'USDC'
		case 'adai':
			return 'DAI'

		default:
			return undefined
	}
}

export default useComposition
