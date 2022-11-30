import Config from '@/bao/lib/config'
import { useWeb3React } from '@web3-react/core'
import { ActiveSupportedBasket } from '../../bao/lib/types'
import { getOraclePrice } from '@/bao/utils'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import type { Uni_v2_lp, Chainoracle } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const usePairPrice = (basket: ActiveSupportedBasket) => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const lpContract = useContract<Uni_v2_lp>('Uni_v2_lp', basket ? basket.lpAddress : null)
	const wethOracle = useContract<Chainoracle>('Chainoracle', Config.contracts.wethPrice[chainId].address)

	const enabled = !!bao && !!library && !!basket && !!lpContract && !!wethOracle
	const { data: pairPrice, refetch } = useQuery(
		['@/hooks/baskets/usePairPrice', providerKey(library, account, chainId), { enabled, nid: basket.nid }],
		async () => {
			const wethPrice = await getOraclePrice(bao, wethOracle)
			const reserves = await lpContract.getReserves()

			// This won't always work. Should check which side of the LP the basket token is on.
			const _price = wethPrice.mul(reserves[0].div(reserves[1]))
			return _price
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

	return pairPrice
}

export default usePairPrice
