import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import Multicall from '@/utils/multicall'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
import useContract from '@/hooks/base/useContract'
import type { Baov2 } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

type RewardsInfo = {
	start: BigNumber
	future: BigNumber
}

const useEpochTime = (): RewardsInfo => {
	const { library, account, chainId } = useWeb3React()
	const bao = useBao()
	const token = useContract<Baov2>('Baov2', Config.contracts.Baov2[chainId].address)

	const enabled = !!bao && !!token
	const { data: epochTime, refetch } = useQuery(
		['@/hooks/vebao/useEpochTime', providerKey(library, account, chainId)],
		async () => {
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

			return {
				start: res[0].values[0],
				future: res[1].values[0],
			}
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) setTimeout(refetch, 0)
	}

	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	console.log(epochTime)

	return epochTime
}

export default useEpochTime
