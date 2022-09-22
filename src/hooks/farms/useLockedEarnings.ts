import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { getBaoContract, getLockedEarned } from '@/bao/utils'

import useBao from '../base/useBao'

const useLockedEarnings = () => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const bao = useBao()
	const baoContract = getBaoContract(bao)

	const fetchBalance = useCallback(async () => {
		const balance = await getLockedEarned(baoContract, account)
		setBalance(BigNumber.from(balance))
	}, [account, baoContract])

	useEffect(() => {
		if (account && baoContract && bao) {
			fetchBalance()
		}
	}, [account, baoContract, bao])

	return balance
}

export default useLockedEarnings
