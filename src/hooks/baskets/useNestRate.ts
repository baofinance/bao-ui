import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'bignumber.js'
import Multicall from '../../utils/multicall'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import { getWethPriceLink } from '../../bao/utils'
import { ActiveSupportedBasket } from '../../bao/lib/types'

type BasketRates = {
	eth: BigNumber
	dai: BigNumber
	usd: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
	const [rates, setRates] = useState<BasketRates | undefined>()
	const bao = useBao()
	const { transactions } = useTransactionProvider()

	const fetchRates = useCallback(async () => {
		const recipe = bao.getContract('recipe')
		const wethPrice = await getWethPriceLink(bao)

		const params = [basket.address, new BigNumber(1e18).toString()]
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
			eth: new BigNumber(res[0].values[0].hex),
			dai: new BigNumber(res[1].values[0].hex),
			usd: wethPrice.times(res[0].values[0].hex),
		})
	}, [bao, basket, transactions])

	useEffect(() => {
		if (!(bao && basket)) return

		fetchRates()
	}, [bao, basket, transactions])

	return rates
}

export default useBasketRates
