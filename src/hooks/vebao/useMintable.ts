import { getMintable } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { Contract } from 'web3-eth-contract'
import useBao from '../base/useBao'

const useMintable = (gaugeContract: Contract) => {
	const [mintable, setMintable] = useState(new BigNumber(0))
	const bao = useBao()

	const fetchAllocation = useCallback(async () => {
		const mintable = await getMintable(bao, gaugeContract)
		setMintable(new BigNumber(mintable))
	}, [gaugeContract, bao])

	useEffect(() => {
		if (gaugeContract && bao) {
			fetchAllocation()
		}
	}, [gaugeContract, setMintable, bao])

	return mintable
}

export default useMintable
