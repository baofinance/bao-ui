import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import useBao from '../base/useBao'

type BasketInfo = {
	totalSupply: BigNumber
}

const useBasketInfo = (basket: ActiveSupportedBasket): BasketInfo => {
	const [info, setInfo] = useState<BasketInfo | undefined>()
	const bao = useBao()

	const fetchInfo = useCallback(async () => {
		const supply = await basket.basketContract.totalSupply()

		setInfo({
			totalSupply: BigNumber.from(supply),
		})
	}, [basket])

	useEffect(() => {
		if (!(bao && basket)) return

		fetchInfo()
	}, [bao, basket])

	return info
}

export default useBasketInfo
