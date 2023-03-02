import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { decimate } from '@/utils/numberFormat'
import { BasketComponent } from './useComposition'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

const useNav = (composition?: BasketComponent[], supply?: BigNumber) => {
	const nav = useMemo(() => {
		if (!composition || !supply) return null
		if (composition.length === 0 || supply.lte('0')) return BigNumber.from('1')
		const _nav = composition
			.reduce((prev, comp) => {
				const balance = parseFloat(formatUnits(comp.balance))
				const price = parseFloat(formatUnits(comp.price))

				return prev.add(parseUnits(formatUnits(balance * price, comp.decimals).toString()))
			}, BigNumber.from(0))
			.div(decimate(supply).lte(0) ? BigNumber.from(1) : decimate(supply))
		return _nav
	}, [composition, supply])

	return nav
}

export default useNav
