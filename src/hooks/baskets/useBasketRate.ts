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
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

export type BasketRates = {
	eth: BigNumber
	dai: BigNumber
	usd: BigNumber
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
			return {
				eth: res[0].values[0],
				dai: res[1].values[0],
				usd: decimate(wethPrice.mul(res[0].values[0]).mul(100)),
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
