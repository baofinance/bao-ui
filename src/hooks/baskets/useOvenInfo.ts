import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'

import Multicall from '@/utils/multicall'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import useBao from '../base/useBao'

export type OvenInfo = {
	balance: BigNumber
	userBalance: BigNumber
	userOutputBalance: BigNumber
	cap: BigNumber
}

const useOvenInfo = (basket: ActiveSupportedBasket, account: string): OvenInfo => {
	const [info, setInfo] = useState<OvenInfo | undefined>()
	const bao = useBao()
	const { library } = useWeb3React()

	const fetchOvenInfo = useCallback(async () => {
		const balance = await library.getBalance(basket.ovenAddress)

		const query = Multicall.createCallContext([
			{
				contract: basket.ovenContract,
				ref: basket.ovenAddress,
				calls: [{ method: 'ethBalanceOf', params: [account] }, { method: 'outputBalanceOf', params: [account] }, { method: 'cap' }],
			},
		])
		const { [basket.ovenAddress]: res } = Multicall.parseCallResults(await bao.multicall.call(query))

		setInfo({
			balance: new BigNumber(balance),
			userBalance: new BigNumber(res[0].values[0].toString()),
			userOutputBalance: new BigNumber(res[1].values[0].toString()),
			cap: new BigNumber(res[2].values[0].toStrig()),
		})
	}, [basket, account, bao, library])

	useEffect(() => {
		if (!(basket && account && bao)) return

		fetchOvenInfo()
	}, [basket, account, bao])

	return info
}

export default useOvenInfo
