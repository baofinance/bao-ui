import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { ActiveSupportedBasket } from '../../bao/lib/types'

export type BasketInfo = {
	totalSupply: BigNumber
}

const useBasketInfo = (basket: ActiveSupportedBasket): BasketInfo => {
	const [info, setInfo] = useState<BasketInfo | undefined>()

	const fetchInfo = useCallback(async () => {
		const supply = await basket.basketContract.totalSupply()
		setInfo({
			totalSupply: supply,
		})
	}, [basket])

	useEffect(() => {
		if (!basket) return

		fetchInfo()
	}, [fetchInfo, basket])

	return info
}

export default useBasketInfo
