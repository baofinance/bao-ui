import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'

import { getBaoContract, getLockedEarned } from '@/bao/utils'

import useBao from '../base/useBao'

const useLockedEarnings = () => {
	const [balance, setBalance] = useState(new BigNumber(0))
	const { account } = useWeb3React()
	const bao = useBao()
	const baoContract = getBaoContract(bao)

	const fetchBalance = useCallback(async () => {
		const balance = await getLockedEarned(baoContract, account)
		setBalance(new BigNumber(balance))
	}, [account, baoContract])

	useEffect(() => {
		if (account && baoContract && bao) {
			fetchBalance()
		}
	}, [account, baoContract, setBalance, bao, fetchBalance])

	return balance
}

export default useLockedEarnings
