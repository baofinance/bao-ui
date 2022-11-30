import { BigNumber } from 'ethers'
import { useCallback } from 'react'
//import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import GraphUtil from '@/utils/graph'
import Multicall from '@/utils/multicall'
import useBao from '@/hooks/base/useBao'
import { decimate, exponentiate, fromDecimal } from '@/utils/numberFormat'
import { Uni_v2_lp__factory } from '@/typechain/factories'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

type TVL = {
	lpAddress: string
	lpStaked: BigNumber
	tvl: BigNumber
}

const useAllFarmTVL = () => {
	const { library, account, chainId } = useWeb3React()
	const bao = useBao()

	const fetchLPInfo = useCallback(async () => {
		const results = Multicall.parseCallResults(
			await bao.multicall.call(
				Multicall.createCallContext(
					Config.farms.map(farm =>
						// single asset farms (TODO: make single asset a config field)
						farm.pid === 14 || farm.pid === 23
							? {
									ref: farm.lpAddresses[chainId],
									contract: Uni_v2_lp__factory.connect(farm.lpAddresses[chainId], library),
									calls: [
										{
											method: 'balanceOf',
											params: [Config.contracts.Masterchef[chainId].address],
										},
										{ method: 'totalSupply' },
									],
							  }
							: {
									ref: farm.lpAddresses[chainId],
									contract: Uni_v2_lp__factory.connect(farm.lpAddresses[chainId], library),
									calls: [
										{ method: 'getReserves' },
										{ method: 'token0' },
										{ method: 'token1' },
										{
											method: 'balanceOf',
											params: [Config.contracts.Masterchef[chainId].address],
										},
										{ method: 'totalSupply' },
									],
							  },
					),
				),
			),
		)

		return Object.keys(results).map((key: string) => {
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
				singleAsset: false,
			}
			return out
		})
	}, [library, chainId, bao])

	const enabled = !!library && !!bao
	const { data: tvl, refetch } = useQuery(
		['@/hooks/farms/useAllFarmTVL', providerKey(library, account, chainId), { enabled }],
		async () => {
			const lps = await fetchLPInfo()
			const wethPrice = await GraphUtil.getPrice(Config.addressMap.WETH)
			const tokenPrices = await GraphUtil.getPriceFromPairMultiple(wethPrice, [Config.addressMap.USDC])

			const tvls: TVL[] = []
			let _tvl = BigNumber.from(0)
			lps.forEach(lpInfo => {
				let lpStakedUSD
				if (lpInfo.singleAsset) {
					lpStakedUSD = decimate(lpInfo.lpStaked).mul(
						fromDecimal(
							Object.values(tokenPrices).find(priceInfo => priceInfo.address.toLowerCase() === lpInfo.lpAddress.toLowerCase()).price,
						),
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
						tokenPrice = fromDecimal(wethPrice)
					else if (token.address.toLowerCase() === Config.addressMap.USDC.toLowerCase() && specialPair)
						// BAO-nDEFI pair
						tokenPrice = fromDecimal(
							Object.values(tokenPrices).find(priceInfo => priceInfo.address.toLowerCase() === Config.addressMap.USDC.toLowerCase()).price,
						)

					const stakeBySupply = exponentiate(lpInfo.lpStaked).div(lpInfo.lpSupply)
					const balanceAtPrice = decimate(token.balance.mul(tokenPrice))
					lpStakedUSD = balanceAtPrice.mul(2).mul(stakeBySupply)
				}

				tvls.push({
					lpAddress: lpInfo.lpAddress,
					tvl: lpStakedUSD,
					lpStaked: lpInfo.lpStaked,
				})
				_tvl = _tvl.add(lpStakedUSD)
			})

			return {
				tvl: _tvl,
				tvls,
			}
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

	return tvl
}

export default useAllFarmTVL
