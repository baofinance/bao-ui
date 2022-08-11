import { ActiveSupportedMarket } from 'bao/lib/types'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import MultiCall from 'utils/multicall'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'

type ExchangeRates = {
	exchangeRates: { [key: string]: BigNumber }
}

export const useExchangeRates = (): ExchangeRates => {
	const [exchangeRates, setExchangeRates] = useState<undefined | { [key: string]: BigNumber }>()
	const { transactions } = useTransactionProvider()
	const bao = useBao()

	const fetchExchangeRates = useCallback(async () => {
		const tokenContracts = bao.contracts.markets.map((market: ActiveSupportedMarket) => market.marketContract)
		const multiCallContext = MultiCall.createCallContext(
			tokenContracts.map(tokenContract => ({
				ref: tokenContract.options.address,
				contract: tokenContract,
				calls: [{ method: 'exchangeRateStored' }],
			})),
		)
		const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))

		setExchangeRates(
			Object.keys(data).reduce(
				(exchangeRate: { [key: string]: BigNumber }, address: any) => ({
					...exchangeRate,
					[address]: new BigNumber(data[address][0].values[0].hex),
				}),
				{},
			),
		)
	}, [transactions, bao])

	useEffect(() => {
		if (!bao) return
		fetchExchangeRates()
	}, [transactions, bao])

	return {
		exchangeRates,
	}
}
