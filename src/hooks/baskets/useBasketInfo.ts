import { BigNumber } from 'bignumber.js'
import useTransactionProvider from 'hooks/base/useTransactionProvider'
import { useCallback, useEffect, useState } from 'react'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import useBao from '../base/useBao'

type BasketInfo = {
	totalSupply: BigNumber
}

const useBasketInfo = (basket: ActiveSupportedBasket): BasketInfo => {
	const [info, setInfo] = useState<BasketInfo | undefined>()
	const bao = useBao()
	const { transactions } = useTransactionProvider()

	const fetchInfo = useCallback(async () => {
		const supply = await basket.basketContract.methods.totalSupply().call()

		setInfo({
			totalSupply: new BigNumber(supply),
		})
	}, [bao, basket])

	useEffect(() => {
		if (!(bao && basket)) return

		fetchInfo()
	}, [bao, basket, transactions])

	return info
}

export default useBasketInfo
