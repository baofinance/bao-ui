import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'

import { ActiveSupportedBasket } from '../../bao/lib/types'
import { getOraclePrice } from '@/bao/utils'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import type { Uni_v2_lp, Chainoracle } from '@/typechain/index'

const usePairPrice = (basket: ActiveSupportedBasket) => {
	const [price, setPrice] = useState<BigNumber>(BigNumber.from(1))
	const bao = useBao()

	const { chainId } = useWeb3React()

	const lpContract = useContract<Uni_v2_lp>('Uni_v2_lp', basket ? basket.lpAddress : '0x000000000000000000000000000000000000dead')
	const wethOracle = useContract<Chainoracle>('Chainoracle', Config.contracts.wethPrice[chainId].address)

	const fetchPairPrice = useCallback(async () => {
		const wethPrice = await getOraclePrice(bao, wethOracle)
		const reserves = await lpContract.getReserves()

		// This won't always work. Should check which side of the LP the basket token is on.
		const _price = wethPrice.mul(reserves[0].div(reserves[1]))
		setPrice(_price)
	}, [bao, lpContract, wethOracle])

	useEffect(() => {
		if (!basket || !bao || !lpContract || !wethOracle) return
		fetchPairPrice()
	}, [fetchPairPrice, basket, bao, lpContract, wethOracle])

	return price
}

export default usePairPrice
