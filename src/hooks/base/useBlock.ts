import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
// import debounce from 'debounce'

const useBlock = () => {
	const [block, setBlock] = useState(0)
	const { library } = useWeb3React()

	useEffect(() => {
		// const setBlockDebounced = debounce(setBlock, 300)
		if (!library) return

		const interval = setInterval(async () => {
			const latestBlockNumber = await library.getBlockNumber()
			setBlock((b: number) => {
				if (b !== latestBlockNumber) {
					return latestBlockNumber
				} else {
					return b
				}
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [library, setBlock])

	return block
}

export default useBlock
