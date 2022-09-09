import { getCrvContract, getMintable } from '@/bao/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useCurrentEpoch from './useCurrentEpoch'
import useFutureEpoch from './useFutureEpoch'

const useMintable = () => {
	const [mintable, setMintable] = useState(new BigNumber(0))
	const bao = useBao()
	const currentEpoch = useCurrentEpoch()
	const futureEpoch = useFutureEpoch()
	const tokenContract = getCrvContract(bao)

	const fetchMintable = useCallback(async () => {
		const mintable = await getMintable(currentEpoch, futureEpoch, tokenContract)
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
