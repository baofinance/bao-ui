import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import useBao from '@/hooks/base/useBao'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import Multicall from '@/utils/multicall'
import { ActiveSupportedBasket } from '@/bao/lib/types'

export type OvenInfo = {
	balance: BigNumber
	userBalance: BigNumber
	userOutputBalance: BigNumber
	cap: BigNumber
}

const useOvenInfo = (basket: ActiveSupportedBasket): OvenInfo => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!basket
	const { data: ovenInfo, refetch } = useQuery(
		['@/hooks/baskets/useOvenInfo', providerKey(library, account, chainId), { enabled, nid: basket.nid }],
		async () => {
			const balance = await library.getBalance(basket.ovenAddress)

			const query = Multicall.createCallContext([
				{
					contract: basket.ovenContract,
					ref: basket.ovenAddress,
					calls: [{ method: 'ethBalanceOf', params: [account] }, { method: 'outputBalanceOf', params: [account] }, { method: 'cap' }],
				},
			])
			const { [basket.ovenAddress]: res } = Multicall.parseCallResults(await bao.multicall.call(query))

			return {
				balance: balance,
				userBalance: res[0].values[0],
				userOutputBalance: res[1].values[0],
				cap: res[2].values[0],
			}
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return ovenInfo
}

export default useOvenInfo
