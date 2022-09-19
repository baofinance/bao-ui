import { getCrvContract, getMintable } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useEpochTime from './useEpochTime'

const useMintable = () => {
	const [mintable, setMintable] = useState(new BigNumber(0))
	const bao = useBao()
	const epochTime = useEpochTime()
	const tokenContract = getCrvContract(bao)

	const fetchMintable = useCallback(async () => {
		const mintable = epochTime && (await getMintable(epochTime.start, epochTime.future, tokenContract)).toString()
		setMintable(new BigNumber(mintable))
	}, [bao])

	useEffect(() => {
		if (bao) {
			fetchMintable()
		}
	}, [setMintable, bao])

	return mintable
}

export default useMintable
