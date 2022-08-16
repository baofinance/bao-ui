import { ActiveSupportedNFT } from '@/bao/lib/types'
import { getNFTs } from '@/bao/utils'
import useBao from '@/hooks/base/useBao'
import { useEffect, useState } from 'react'

const useNFTs = (): ActiveSupportedNFT[] => {
	const [nfts, setNFTs] = useState<ActiveSupportedNFT[] | undefined>()
	const bao = useBao()

	useEffect(() => {
		if (bao) setNFTs(getNFTs(bao))
	}, [bao])

	return nfts
}

export default useNFTs
