import { BigNumber } from 'ethers'
import BN from 'bignumber.js'
import { useEffect, useState } from 'react'

import { decimate } from '@/utils/numberFormat'

import { BasketComponent } from './useComposition'

const useNav = (composition: BasketComponent[], supply: BigNumber) => {
	const [nav, setNav] = useState<BN | undefined>()

	useEffect(() => {
		if (!(composition && supply)) return

		// FIXME: uses bignumber.js
		const _nav = composition
			.reduce((prev, comp) => {
				return prev.plus(comp.price.times(new BN(comp.balance.toString()).div(10 ** comp.decimals).toString()))
			}, new BN(0))
			.div(supply.toString())
		console.log(_nav)
		setNav(_nav)
	}, [composition, supply])

	return nav
}

export default useNav
