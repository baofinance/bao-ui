import { getGaugeControllerContract, getUserVotingPower } from '@/bao/utils'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useVotingPowerAllocated = () => {
	const [votingPower, setVotingPower] = useState(BigNumber.from(0))
	const bao = useBao()
	const { account } = useWeb3React()
	const gaugeControllerContract = getGaugeControllerContract(bao)

	const fetchVotingPower = useCallback(async () => {
		const votingPower = await getUserVotingPower(gaugeControllerContract, account)
		setVotingPower(BigNumber.from(votingPower))
	}, [gaugeControllerContract, bao])

	useEffect(() => {
		if (gaugeControllerContract && bao) {
			fetchVotingPower()
		}
	}, [gaugeControllerContract, bao])

	return votingPower
}

export default useVotingPowerAllocated
