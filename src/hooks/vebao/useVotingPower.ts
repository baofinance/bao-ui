import { getVotingEscrowContract, getVotingPower } from '@/bao/utils'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useTransactionHandler from '../base/useTransactionHandler'

const useVotingPower = () => {
	const [votingPower, setVotingPower] = useState(new BigNumber(0))
	const bao = useBao()
	const { account } = useWeb3React()
	const votingEscrowContract = getVotingEscrowContract(bao)
	const transactions = useTransactionHandler()

	const fetchVotingPower = useCallback(async () => {
		const votingPower = await getVotingPower(votingEscrowContract, account)
		setVotingPower(new BigNumber(votingPower))
	}, [votingEscrowContract, account])

	useEffect(() => {
		if (votingEscrowContract && bao) {
			fetchVotingPower()
		}
	}, [votingEscrowContract, bao, transactions])

	return votingPower
}

export default useVotingPower
