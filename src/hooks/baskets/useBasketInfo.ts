import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

export type BasketInfo = {
	totalSupply: BigNumber
}

const useBasketInfo = (basket: ActiveSupportedBasket): BasketInfo => {
	const { library, account, chainId } = useWeb3React()

	const enabled = !!library && !!basket && !!basket.basketContract
	const { data: basketInfo, refetch } = useQuery(
		['@/hooks/baskets/useBasketInfo', providerKey(library, account, chainId), { enabled, nid: basket.nid }],
		async () => {
			const supply = await basket.basketContract.totalSupply()
			return {
				totalSupply: supply,
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

	return basketInfo
}

export default useBasketInfo
