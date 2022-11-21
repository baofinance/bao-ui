import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import useContract from '@/hooks/base/useContract'
import type { Masterchef } from '@/typechain/index'

export const useUserFarmInfo = (pid: number) => {
	const [userInfo, setUserInfo] = useState<any | undefined>()
	const { account } = useWeb3React()

	const masterChefContract = useContract<Masterchef>('Masterchef')

	const fetchUserInfo = useCallback(async () => {
		const _userInfo = await masterChefContract.userInfo(pid, account)
		setUserInfo(_userInfo)
	}, [pid, masterChefContract, account])

	useEffect(() => {
		if (!account || !masterChefContract) return
		fetchUserInfo()
	}, [fetchUserInfo, masterChefContract, account])

	return userInfo
}
