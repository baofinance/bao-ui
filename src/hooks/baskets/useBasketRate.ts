import { BigNumber, ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import Multicall from '@/utils/multicall'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import { getWethPriceLink } from '../../bao/utils'
import useBao from '../base/useBao'

type BasketRates = {
	eth: BigNumber
	dai: BigNumber
	usd: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
	const [rates, setRates] = useState<BasketRates | undefined>()
	const bao = useBao()

	const fetchRates = useCallback(async () => {
		const recipe = bao.getContract('recipe')
		const wethPrice = await getWethPriceLink(bao)

		const params = [basket.address, BigNumber.from(ethers.utils.parseEther('1'))]
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
			usd: wethPrice.mul(res[0].values[0]),
		})
	}, [bao, basket])

	useEffect(() => {
		if (!(bao && basket)) return

		fetchRates()
	}, [bao, basket])

	return rates
}

export default useBasketRates
