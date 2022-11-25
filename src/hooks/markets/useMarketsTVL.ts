import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { decimate } from '@/utils/numberFormat'
import { useMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import useContract from '@/hooks/base/useContract'
import type { Stabilizer } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useMarketsTVL = () => {
	const { library, account, chainId } = useWeb3React()
	const markets = useMarkets()
	const { prices } = useMarketPrices() // TODO- use market.price instead of market prices hook

	const stabilizer = useContract<Stabilizer>('Stabilizer')

	const enabled = !!markets && !!stabilizer && !!prices
	const { data: tvl, refetch } = useQuery(
		['@/hooks/markets/useMarketsTVL', providerKey(library, account, chainId), prices],
		async () => {
			const marketsTvl = markets.reduce((prev, current) => {
				const _tvl = BigNumber.from(current.supplied).sub(current.totalBorrows).mul(prices[current.marketAddress])
				return prev.add(decimate(_tvl, current.underlyingDecimals))
			}, BigNumber.from(0))

			// Assume $1 for DAI - need to use oracle price
			const ballastTvl = await stabilizer.supply()
			return marketsTvl.add(decimate(ballastTvl))
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

	return tvl
}
