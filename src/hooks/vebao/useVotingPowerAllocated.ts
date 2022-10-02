import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'

const useVotingPowerAllocated = () => {
	const [votingPower, setVotingPower] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const gaugeController = useContract<GaugeController>('GaugeController')

	const fetchVotingPower = useCallback(async () => {
		const votingPower = await gaugeController.vote_user_power(account)
		setVotingPower(votingPower)
	}, [gaugeController, account])

	useEffect(() => {
		if (gaugeController) {
			fetchVotingPower()
		}
	}, [fetchVotingPower, gaugeController])

	return votingPower
}

export default useVotingPowerAllocated
