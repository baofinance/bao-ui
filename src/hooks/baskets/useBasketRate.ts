import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import Multicall from '@/utils/multicall'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import { getWethPriceLink } from '../../bao/utils'
import useBao from '../base/useBao'
import useContract from '@/hooks/base/useContract'
import type { SimpleUniRecipe } from '@/typechain/index'

export type BasketRates = {
	eth: BigNumber
	dai: BigNumber
	usd: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
	const [rates, setRates] = useState<BasketRates | undefined>()
	const bao = useBao()

	const recipe = useContract<SimpleUniRecipe>('SimpleUniRecipe')

	const fetchRates = useCallback(async () => {
		const wethPrice = await getWethPriceLink(bao)

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
			usd: wethPrice.mul(res[0].values[0]).mul(100).div(BigNumber.from(10).pow(18)),
		})
	}, [recipe, bao, basket])

	useEffect(() => {
		if (!(bao && recipe && basket)) return

		fetchRates()
	}, [bao, fetchRates, recipe, basket])

	return rates
}

export default useBasketRates
