import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { FeeDistributor__factory } from '@/typechain/factories'

export const useNextDistribution = () => {
	const [nextDistribution, setNextDistribution] = useState<BigNumber | undefined>()
	const { library, chainId } = useWeb3React()

	const fetchNextDistribution = useCallback(async () => {
		const feeDistributorAddr = Config.contracts.feeDistributor[chainId].address
		const feeDistributionContract = FeeDistributor__factory.connect(feeDistributorAddr, library)
		const nextFeeDistribution = await feeDistributionContract.last_token_time({ gasLimit: 100000 })
		setNextDistribution(nextFeeDistribution)
	}, [library, chainId])

	useEffect(() => {
		if (!library || !chainId) return
		fetchNextDistribution()
	}, [library, chainId, fetchNextDistribution])

	return nextDistribution
}
