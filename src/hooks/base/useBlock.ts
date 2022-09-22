import { useWeb3React } from '@web3-react/core'
import { useBlockNumber } from 'eth-hooks'

const useBlock = () => {
	const { library } = useWeb3React()
	const [block] = useBlockNumber(library, (bn?: number) => {}, {
		refetchInterval: undefined,
		blockNumberInterval: 10,
	})
	return block
}

export default useBlock
