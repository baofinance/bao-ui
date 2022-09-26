import { getCrvContract, getMintable } from '@/bao/utils'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useEpochTime from './useEpochTime'

const useMintable = () => {
	const [mintable, setMintable] = useState(BigNumber.from(0))
	const bao = useBao()
	const epochTime = useEpochTime()
	const tokenContract = getCrvContract(bao)

	const fetchMintable = useCallback(async () => {
		if (epochTime) {
			const mintable = await getMintable(epochTime.start, epochTime.future, tokenContract)
			setMintable(mintable)
		}
	}, [epochTime, tokenContract])

	useEffect(() => {
		if (epochTime) {
			fetchMintable()
		}
	}, [epochTime, fetchMintable])

	return mintable
}

export default useMintable
