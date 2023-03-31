import { Chainoracle } from '@/typechain/Chainoracle'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from './useBao'
import { useBlockUpdater } from './useBlock'
import useContract from './useContract'
import { useTxReceiptUpdater } from './useTransactionProvider'

export const useOraclePrice = (address: string) => {
	const bao = useBao()
	const oracle = useContract<Chainoracle>('Chainoracle', address)
	const { chainId } = useWeb3React()

	const enabled = !!bao && !!oracle && !!chainId

	const { data: price, refetch } = useQuery(
		['@/hooks/markets/useMarketPrices', { enabled }],
		async () => {
			const _price = await oracle.latestAnswer()
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
