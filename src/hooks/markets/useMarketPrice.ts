import { MarketOracle } from '@/typechain/MarketOracle'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
import { useBlockUpdater } from '../base/useBlock'
import useContract from '../base/useContract'
import { useTxReceiptUpdater } from '../base/useTransactionProvider'

export const useMarketPrice = (address: string) => {
	const bao = useBao()
	const oracle = useContract<MarketOracle>('MarketOracle')
	const { chainId } = useWeb3React()

	const enabled = !!bao && !!oracle && !!chainId

	const { data: price, refetch } = useQuery(
		['@/hooks/markets/useMarketPrice', { enabled }],
		async () => {
			const _price = await oracle.getUnderlyingPrice(address)
			return _price
		},
		{
			enabled,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return price
}
