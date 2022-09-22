import { getVirtualPrice } from '@/bao/utils'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from '@ethersproject/contracts'
import useBao from '../base/useBao'

const useVirtualPrice = (poolContract: Contract) => {
	const [virtualPrice, setVirtualPrice] = useState(BigNumber.from(0))
	const bao = useBao()

	const fetchVirtualPrice = useCallback(async () => {
		const virtualPrice = await getVirtualPrice(poolContract)
		setVirtualPrice(BigNumber.from(virtualPrice))
	}, [poolContract, setVirtualPrice])

	useEffect(() => {
		if (poolContract && bao) {
			fetchVirtualPrice()
		}
	}, [poolContract, bao])

	return virtualPrice
}

export default useVirtualPrice
