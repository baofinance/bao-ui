import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import Multicall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { decimate } from '@/utils/numberFormat'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import { getOraclePrice } from '@/bao/utils'
import useBao from '../base/useBao'
import useContract from '@/hooks/base/useContract'
import type { SimpleUniRecipe, Chainoracle } from '@/typechain/index'

export type BasketRates = {
	eth: BigNumber
	dai: BigNumber
	usd: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
	const [rates, setRates] = useState<BasketRates | undefined>()
	const bao = useBao()

	const { chainId } = useWeb3React()

	const recipe = useContract<SimpleUniRecipe>('SimpleUniRecipe')
	const wethOracle = useContract<Chainoracle>('Chainoracle', Config.contracts.wethPrice[chainId].address)

	const fetchRates = useCallback(async () => {
		const wethPrice = await getOraclePrice(bao, wethOracle)

		const params = [basket.address, ethers.utils.parseEther('1')]
		const query = Multicall.createCallContext([
			{
				contract: recipe,
				ref: 'recipe',
				calls: [
					{
						method: 'getPriceEth',
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

		setRates({
			eth: res[0].values[0],
			dai: res[1].values[0],
			usd: decimate(wethPrice.mul(res[0].values[0]).mul(100)),
		})
	}, [recipe, bao, basket, wethOracle])

	useEffect(() => {
		if (!(bao && recipe && basket)) return

		fetchRates()
	}, [bao, fetchRates, recipe, basket])

	return rates
}

export default useBasketRates
