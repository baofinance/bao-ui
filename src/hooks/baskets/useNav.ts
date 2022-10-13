import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { decimate } from '@/utils/numberFormat'
import { BasketComponent } from './useComposition'

const useNav = (composition: BasketComponent[], supply: BigNumber) => {
	const nav = useMemo(() => {
		if (!composition) return null
		const _nav = composition
			.reduce((prev, comp) => {
				return prev.add(decimate(comp.price.mul(comp.balance), comp.decimals))
			}, BigNumber.from(0))
			.div(decimate(supply))
		return _nav
	}, [composition, supply])

	return nav
}

export default useNav
