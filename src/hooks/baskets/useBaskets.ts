import { useEffect, useState } from 'react'

import { ActiveSupportedBasket } from '@/bao/lib/types'
import { getBaskets } from '@/bao/utils'
import useBao from '@/hooks/base/useBao'

const useBaskets = (): ActiveSupportedBasket[] => {
	const [baskets, setBaskets] = useState<ActiveSupportedBasket[] | undefined>()
	const bao = useBao()

	useEffect(() => {
		if (bao) setBaskets(getBaskets(bao))
	}, [bao])

	return baskets
}

export default useBaskets
