import { getVirtualPrice } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from 'web3-eth-contract'
import useBao from '../base/useBao'

const useVirtualPrice = (poolContract: Contract) => {
	const [virtualPrice, setVirtualPrice] = useState(new BigNumber(0))
	const bao = useBao()

	const fetchVirtualPrice = useCallback(async () => {
		const virtualPrice = await getVirtualPrice(poolContract)
		setVirtualPrice(new BigNumber(virtualPrice))
	}, [poolContract, bao])

	useEffect(() => {
		if (poolContract && bao) {
			fetchVirtualPrice()
		}
	}, [poolContract, setVirtualPrice, bao])

	return virtualPrice
}

export default useVirtualPrice
