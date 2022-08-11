import { Bao } from 'bao'
import { Context } from 'contexts/BaoProvider'
import { useContext } from 'react'

const useBao = (): Bao => {
	const { bao }: any = useContext(Context)
	return bao
}

export default useBao
