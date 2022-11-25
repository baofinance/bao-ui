import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import Multicall from '@/utils/multicall'
import useBao from '../base/useBao'
import { useAccountLiquidity } from './useAccountLiquidity'
import { useAccountMarkets } from './useMarkets'
import { useMarketPrices } from './usePrices'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { decimate } from '@/utils/numberFormat'

const useHealthFactor = () => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const markets = useAccountMarkets()
	const accountLiquidity = useAccountLiquidity()
	const { prices } = useMarketPrices()

	const enabled = !!bao && !!account && !!markets && !!accountLiquidity && !!prices
	const { data: healthFactor, refetch } = useQuery(
		['@/hooks/markets/useHealthFactor', providerKey(library, account, chainId), accountLiquidity, prices],
		async () => {
			const usdBorrow = accountLiquidity.usdBorrow
			const _markets = markets.filter(market => !market.isSynth)

			const balanceQuery = Multicall.createCallContext(
				_markets.map(market => ({
					contract: market.marketContract,
					ref: market.marketAddress,
					calls: [{ method: 'balanceOfUnderlying', params: [account] }],
				})),
			)
			const balanceRes = Multicall.parseCallResults(await bao.multicall.call(balanceQuery))

			if (Object.keys(balanceRes).length === 0) return BigNumber.from(0)

			const collateralSummation = _markets.reduce((prev, cur) => {
				const next = BigNumber.from(prices[cur.marketAddress]).mul(balanceRes[cur.marketAddress][0].values[0]).mul(cur.collateralFactor)
				return prev.add(decimate(next, cur.underlyingDecimals))
			}, BigNumber.from(0))

			try {
				const _healthFactor = collateralSummation.div(usdBorrow)
				return _healthFactor
			} catch {
				return BigNumber.from(0)
			}
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

	return healthFactor
}

export default useHealthFactor
