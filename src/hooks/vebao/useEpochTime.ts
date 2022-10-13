import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import Multicall from '@/utils/multicall'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useContract from '@/hooks/base/useContract'
import type { Erc20bao } from '@/typechain/index'

type RewardsInfo = {
	start: BigNumber
	future: BigNumber
}

const useEpochTime = (): RewardsInfo => {
	const [epochTime, setEpochTime] = useState<RewardsInfo | undefined>()
	const { chainId } = useWeb3React()
	const bao = useBao()
	const token = useContract<Erc20bao>('Erc20bao', Config.contracts.Crv[chainId].address)

	const fetchEpochTime = useCallback(async () => {
		const query = Multicall.createCallContext([
			{
				contract: token,
				ref: 'bao',
				calls: [
					{
						method: 'start_epoch_time_write',
					},
					{
						method: 'future_epoch_time_write',
					},
				],
			},
		])

		const { bao: res } = Multicall.parseCallResults(await bao.multicall.call(query))

		setEpochTime({
			start: res[0].values[0],
			future: res[1].values[0],
		})
	}, [bao, token])

	useEffect(() => {
		if (!bao || !token) return

		fetchEpochTime()
	}, [fetchEpochTime, bao, token])

	return epochTime
}

export default useEpochTime
