import { Bao } from '@/bao/Bao'
import { useContext } from 'react'

import { Context } from '@/contexts/BaoProvider'

const useBao = (): Bao => {
	const { bao }: any  = useContext(Context)
	return bao
}

export default useBao
