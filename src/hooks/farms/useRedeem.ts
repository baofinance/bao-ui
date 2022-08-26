import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { Contract } from 'web3-eth-contract'

import { redeem } from '@/bao/utils'

const useRedeem = (masterChefContract: Contract) => {
	const { account } = useWeb3React()

	const handleRedeem = useCallback(async () => {
		const txHash = await redeem(masterChefContract, account)
		console.log(txHash)
		return txHash
	}, [account, masterChefContract])

	return { onRedeem: handleRedeem }
}

export default useRedeem
