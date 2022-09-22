import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'

import { decimate } from '@/utils/numberFormat'

import { BasketComponent } from './useComposition'

const useNav = (composition: BasketComponent[], supply: BigNumber) => {
	const [nav, setNav] = useState<BigNumber | undefined>()

	useEffect(() => {
		if (!(composition && supply)) return

		setNav(
			composition
				.reduce((prev, comp) => prev.add(comp.price.mul(comp.balance.div(10 ** comp.decimals))), BigNumber.from(0))
				.div(decimate(supply)),
		)
	}, [composition, supply])

	return nav
}

export default useNav
