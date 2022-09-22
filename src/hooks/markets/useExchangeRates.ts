import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'

import { ActiveSupportedMarket } from '@/bao/lib/types'
import MultiCall from '@/utils/multicall'

import useBao from '../base/useBao'

type ExchangeRates = {
	exchangeRates: { [key: string]: BigNumber }
}

export const useExchangeRates = (): ExchangeRates => {
	const [exchangeRates, setExchangeRates] = useState<undefined | { [key: string]: BigNumber }>()
	const bao = useBao()

	const fetchExchangeRates = useCallback(async () => {
		const tokenContracts = bao.contracts.markets.map((market: ActiveSupportedMarket) => market.marketContract)
		const multiCallContext = MultiCall.createCallContext(
			tokenContracts.map(tokenContract => ({
				ref: tokenContract.address,
				contract: tokenContract,
				calls: [{ method: 'exchangeRateStored' }],
			})),
		)
		const data = MultiCall.parseCallResults(await bao.multicall.call(multiCallContext))

		setExchangeRates(
			Object.keys(data).reduce(
				(exchangeRate: { [key: string]: BigNumber }, address: string) => ({
					...exchangeRate,
					[address]: data[address][0].values[0],
				}),
				{},
			),
		)
	}, [bao])

	useEffect(() => {
		if (!bao) return
		fetchExchangeRates()
	}, [bao])

	return {
		exchangeRates,
	}
}
