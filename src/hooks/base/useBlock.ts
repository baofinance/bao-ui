import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
// import debounce from 'debounce'

const useBlock = () => {
	const [block, setBlock] = useState(0)
	const { library } = useWeb3React()

	useEffect(() => {
		// const setBlockDebounced = debounce(setBlock, 300)
		if (!library) return
		window.library = library

		// const subscription = new Web3(ethereum).eth.subscribe(
		//   'newBlockHeaders',
		//   (error, result) => {
		//     if (!error) {
		//       setBlockDebounced(result.number)
		//     }
		//   },
		// )

		const interval = setInterval(async () => {
			const latestBlockNumber = await library.getBlockNumber()
			if (block !== latestBlockNumber) {
				setBlock(latestBlockNumber)
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [library])

	return block
}

export default useBlock
