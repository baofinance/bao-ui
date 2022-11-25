import { BigNumber } from 'ethers'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import MultiCall from '@/utils/multicall'
import useBao from '../base/useBao'
import { useMarkets } from '@/hooks/markets/useMarkets'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

type ExchangeRates = {
	exchangeRates: { [key: string]: BigNumber }
}

export const useExchangeRates = (): ExchangeRates => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const markets = useMarkets()

	const enabled = !!bao && !!markets && !!account
	const { data: exchangeRates, refetch } = useQuery(
		['@/hooks/markets/useExchangeRates', providerKey(library, account, chainId)],
		async () => {
			const tokenContracts = markets.map((market: ActiveSupportedMarket) => market.marketContract)
			const multiCallContext = MultiCall.createCallContext(
				tokenContracts.map(tokenContract => ({
					ref: tokenContract.address,
					contract: tokenContract,
					calls: [{ method: 'exchangeRateStored' }],
				})),
			)
			const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))

			return Object.keys(data).reduce(
				(exchangeRate: { [key: string]: BigNumber }, address: string) => ({
					...exchangeRate,
					[address]: data[address][0].values[0],
				}),
				{},
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return {
		exchangeRates,
	}
}
