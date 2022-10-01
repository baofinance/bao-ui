import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useContract from '@/hooks/base/useContract'
import type { Bao } from '@/typechain/index'

const useLockedEarnings = () => {
	const [balance, setBalance] = useState(BigNumber.from(0))
	const { account } = useWeb3React()
	const baoContract = useContract<Bao>('Bao')

	const fetchBalance = useCallback(async () => {
		const balance = await baoContract.lockOf(account)
		setBalance(balance)
	}, [account, baoContract])

	useEffect(() => {
		if (!account || !baoContract) return
		fetchBalance()
	}, [fetchBalance, account, baoContract])

	return balance
}

export default useLockedEarnings
