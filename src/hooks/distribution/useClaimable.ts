import useContract from '@/hooks/base/useContract'
import type { BaoDistribution } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

const useClaimable = () => {
	const [claimable, setClaimable] = useState(BigNumber.from(0))
	const { account, library } = useWeb3React()
	const distributionContract = useContract<BaoDistribution>('BaoDistribution')

	const fetchClaimable = useCallback(async () => {
		const claimable = await distributionContract.claimable(account, 0)
		setClaimable(claimable)
	}, [account, distributionContract])

	useEffect(() => {
		if (!account || !distributionContract) return
		fetchClaimable()
	}, [fetchClaimable, account, distributionContract])

	return claimable
}

export default useClaimable
