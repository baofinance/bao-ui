import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { BasketComponent } from './useComposition'

const useNav = (composition: BasketComponent[], supply: BigNumber) => {
	const nav = useMemo(() => {
		if (!composition) return null
		const _nav = composition
			.reduce((prev, comp) => {
				return prev.add(comp.price.mul(comp.balance.div(BigNumber.from(10).pow(comp.decimals))))
			}, BigNumber.from(0))
			.div(supply.div(BigNumber.from(10).pow(18)))
		return _nav
	}, [composition, supply])

	return nav
}

export default useNav
