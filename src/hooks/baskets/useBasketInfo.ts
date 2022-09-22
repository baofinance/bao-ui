import BigNumber from 'bignumber.js'
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
			totalSupply: supply,
		})
		console.log(supply.toString())
	}, [basket])

	useEffect(() => {
		if (!(bao && basket)) return

		fetchInfo()
	}, [bao, basket])

	return info
}

export default useBasketInfo
