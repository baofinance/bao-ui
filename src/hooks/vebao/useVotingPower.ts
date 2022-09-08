import { getVotingEscrowContract, getVotingPower } from '@/bao/utils'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'

const useVotingPower = () => {
	const [votingPower, setVotingPower] = useState(new BigNumber(0))
	const bao = useBao()
	const { account } = useWeb3React()
	const votingEscrowContract = getVotingEscrowContract(bao)

	const fetchWeight = useCallback(async () => {
		const votingPower = await getVotingPower(votingEscrowContract, account)
		setVotingPower(new BigNumber(votingPower))
	}, [votingEscrowContract, bao])

	useEffect(() => {
		if (votingEscrowContract && bao) {
			fetchWeight()
		}
	}, [votingEscrowContract, setVotingPower, bao])

	return votingPower
}

export default useVotingPower
