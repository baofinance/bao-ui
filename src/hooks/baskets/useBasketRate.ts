import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import { getOraclePrice } from '@/bao/utils'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import type { Chainoracle, SimpleUniRecipe } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { decimate } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import useBao from '../base/useBao'

export type BasketRates = {
	eth: BigNumber
	usd: BigNumber
	dai: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const recipe = useContract<SimpleUniRecipe>('SimpleUniRecipe', basket.recipeAddress)
	const wethOracle = useContract<Chainoracle>('Chainoracle', Config.contracts.wethPrice[chainId].address)

	const enabled = !!bao && !!library && !!recipe && !!wethOracle
	const { data: rates, refetch } = useQuery(
		['@/hooks/baskets/useBasketRates', providerKey(library, account, chainId), { enabled, nid: basket.nid }],
		async () => {
			const wethPrice = await getOraclePrice(bao, wethOracle)
			const params = [basket.address, ethers.utils.parseEther('1')]
			const query = Multicall.createCallContext([
				{
					contract: recipe,
					ref: 'recipe',
					calls: [
						{
							method: 'getPriceUSD',
							params,
						},
						{
							method: 'getPrice',
							params,
						},
					],
				},
			])
			const { recipe: res } = Multicall.parseCallResults(await bao.multicall.call(query))
			return {
				dai: res[0].values[0],
				eth: res[1].values[0],
				usd: decimate(wethPrice.mul(res[1].values[0]).mul(100)),
			}
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

	return rates
}

export default useBasketRates
