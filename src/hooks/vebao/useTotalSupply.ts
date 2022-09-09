import { getTotalSupply } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from 'web3-eth-contract'
import useBao from '../base/useBao'

const useTotalSupply = (gaugeContract: Contract) => {
	const [totalSupply, setTotalSupply] = useState(new BigNumber(0))
	const bao = useBao()

	const fetchTotalSupply = useCallback(async () => {
		const totalSupply = await getTotalSupply(gaugeContract)
		setTotalSupply(new BigNumber(totalSupply))
	}, [gaugeContract, bao])

	useEffect(() => {
		if (gaugeContract && bao) {
			fetchTotalSupply()
		}
	}, [gaugeContract, setTotalSupply, bao])

	return totalSupply
}

export default useTotalSupply
