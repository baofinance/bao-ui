import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import useBao from '../base/useBao'

const useVirtualPrice = (poolContract?: Contract) => {
	const [virtualPrice, setVirtualPrice] = useState(BigNumber.from(0))
	const bao = useBao()

	const fetchVirtualPrice = useCallback(async () => {
		const virtualPrice = await poolContract.get_virtual_price()
		setVirtualPrice(BigNumber.from(virtualPrice))
	}, [poolContract, setVirtualPrice])

	useEffect(() => {
		if (poolContract && bao) {
			fetchVirtualPrice()
		}
	}, [fetchVirtualPrice, poolContract, bao])

	return virtualPrice
}

export default useVirtualPrice
