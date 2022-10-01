import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import { getWethPriceLink } from '../../bao/utils'
import useBao from '../base/useBao'
import useContract from '@/hooks/base/useContract'
import type { Uni_v2_lp } from '@/typechain/index'

const usePairPrice = (basket: ActiveSupportedBasket) => {
	const [price, setPrice] = useState<BigNumber>(BigNumber.from(1))
	const bao = useBao()

	const lpContract = useContract<Uni_v2_lp>('Uni_v2_lp', (basket && basket.lpAddress || '0x000000000000000000000000000000000000dead'))

	const fetchPairPrice = useCallback(async () => {
		const wethPrice = await getWethPriceLink(bao)
		const reserves = await lpContract.getReserves()

		// This won't always work. Should check which side of the LP the basket token is on.
		const _price = wethPrice.mul(reserves[0].div(reserves[1]))
		console.log(wethPrice.toString(), reserves[1].div(reserves[0]).toString(), reserves[1].toString())
		setPrice(_price)
	}, [bao, lpContract])

	useEffect(() => {
		if (!basket || !bao || !lpContract) return
		fetchPairPrice()
	}, [fetchPairPrice, basket, bao, lpContract])

	return price
}

export default usePairPrice
