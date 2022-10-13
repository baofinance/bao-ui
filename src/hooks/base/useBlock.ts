import { useContext, useRef, useEffect, useState } from 'react'
import { BaoContext } from '@/contexts/BaoProvider'

const useBlock = (): number => {
	const { block }: BaoContext = useContext(BaoContext)
	return block
}

/**
 * #### Summary
 * A hook that invokes an update callback function based on update options and ethers network state (i.e. block number)
 *
 * @param interval The number of blocks that should pass before calling the callback
 * @param callback Function to call when the proper number of blocks have passed
 * @param allowUpdate Switch the callback interval on or off
 */
export const useBlockUpdater = (callback: (() => void) | (() => Promise<void>), interval = 1, allowUpdate = true): void => {
	const block = useBlock()
	const updateNumberRef = useRef<number>(block)
	if (allowUpdate) {
		// number that only increases every (X * options.blockNumberInterval) blocks
		const blockNumberFilter = block > 0 ? Math.floor(block / (interval ?? 1)) : undefined
		if (blockNumberFilter !== updateNumberRef.current) {
			updateNumberRef.current = blockNumberFilter
			callback()
		}
	}
}

export default useBlock
