import { BigNumber } from 'ethers'
import { Multicall as MC } from 'ethereum-multicall'
import { useCallback, useEffect, useState } from 'react'
import { Provider } from '@ethersproject/providers'

import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import useBao from '@/hooks/base/useBao'
import { decimate } from '@/utils/numberFormat'
import { Uni_v2_lp__factory } from '@/typechain/factories'

export const fetchLPInfo = async (farms: any[], multicall: MC, library: Provider) => {
	const results = Multicall.parseCallResults(
		await multicall.call(
			Multicall.createCallContext(
				farms.map(farm =>
					farm.pid === 14 || farm.pid === 23 // single asset farms (TODO: make single asset a config field)
						? ({
								ref: farm.lpAddresses[Config.networkId],
								contract: Uni_v2_lp__factory.connect(farm.lpAddresses[Config.networkId], library),
								calls: [
									{
										method: 'balanceOf',
										params: [Config.contracts.Masterchef[Config.networkId].address],
									},
									{ method: 'totalSupply' },
								],
						  } as any)
						: ({
								ref: farm.lpAddresses[Config.networkId],
								contract: Uni_v2_lp__factory.connect(farm.lpAddresses[Config.networkId], library),
								calls: [
									{ method: 'getReserves' },
									{ method: 'token0' },
									{ method: 'token1' },
									{
										method: 'balanceOf',
										params: [Config.contracts.Masterchef[Config.networkId].address],
									},
									{ method: 'totalSupply' },
								],
						  } as any),
				),
			),
		),
	)

	return Object.keys(results).map((key: any) => {
		const res0 = results[key]

		const r0 = res0[0].values[0]
		const r1 = res0[0].values[1]

		const token0Address = res0[1].values[0]
		const token1Address = res0[2].values[0]

		const tokens = [
			{
				address: token0Address,
				balance: decimate(r0),
			},
			{
				address: token1Address,
				balance: decimate(r1, token1Address === Config.addressMap.USDC ? 6 : 18),
				// This sucks. Should consider token decimals rather than check manually. Luckily, we're getting rid of farms soon & there's only 3 left.
			},
		]

		const lpStaked = res0[3].values[0]
		const lpSupply = res0[4].values[0]

		const out = {
			tokens,
			lpAddress: key,
			lpStaked,
			lpSupply,
		}
		return out
	})
}

const useAllFarmTVL = () => {
	const [tvl, setTvl] = useState<any | undefined>()

	const { library } = useWeb3React()
	const bao = useBao()

	const fetchAllFarmTVL = useCallback(async () => {
		const lps: any = await fetchLPInfo(Config.farms, bao.multicall, library)
		const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
		const tokenPrices = await GraphUtil.getPriceFromPairMultiple(wethPrice, [Config.addressMap.USDC])

		const tvls: any[] = []
		let _tvl = BigNumber.from(0)
		lps.forEach((lpInfo: any) => {
			let lpStakedUSD
			if (lpInfo.singleAsset) {
				lpStakedUSD = decimate(lpInfo.lpStaked).mul(
					Object.values(tokenPrices).find(priceInfo => priceInfo.address.toLowerCase() === lpInfo.lpAddress.toLowerCase()).price,
				)
				_tvl = _tvl.add(lpStakedUSD)
			} else {
				let token, tokenPrice, specialPair
				if (
					lpInfo.tokens[0].address.toLowerCase() === Config.addressMap.BAO.toLowerCase() &&
					lpInfo.tokens[1].address.toLowerCase() === Config.addressMap.USDC.toLowerCase()
				) {
					// BAO-USDC pair
					token = lpInfo.tokens[1]
					specialPair = true
				} else token = lpInfo.tokens[1]

				if (token.address.toLowerCase() === Config.addressMap.WETH.toLowerCase())
					// *-wETH pair
					tokenPrice = wethPrice
				else if (token.address.toLowerCase() === Config.addressMap.USDC.toLowerCase() && specialPair)
					// BAO-nDEFI pair
					tokenPrice = Object.values(tokenPrices).find(
						priceInfo => priceInfo.address.toLowerCase() === Config.addressMap.USDC.toLowerCase(),
					).price

				lpStakedUSD = token.balance.toNumber() * tokenPrice * 2 * lpInfo.lpStaked.div(lpInfo.lpSupply).toNumber()
			}

			tvls.push({
				lpAddress: lpInfo.lpAddress,
				tvl: lpStakedUSD,
				lpStaked: lpInfo.lpStaked,
			})
			_tvl = _tvl.add(lpStakedUSD)
		})
		setTvl({
			tvl: _tvl,
			tvls,
		})
	}, [bao, library])

	useEffect(() => {
		// Only fetch TVL once per page load
		if (!(library && bao) || tvl) return

		fetchAllFarmTVL()
	}, [fetchAllFarmTVL, bao, library, tvl])

	return tvl
}

export default useAllFarmTVL
