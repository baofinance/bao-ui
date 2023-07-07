import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { PoolInfo__factory, SaddlePool__factory, Uni_v2_lp__factory, BalancerVault__factory } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers/lib/ethers'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'
import { formatUnits } from 'ethers/lib/utils'

type PoolInfoTypes = {
	token0Address: string
	token1Address: string
	token0Decimals: BigNumber
	token1Decimals: BigNumber
	token0Balance: BigNumber
	token1Balance: BigNumber
}

const usePoolInfo = (gauge: ActiveSupportedGauge): PoolInfoTypes => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()

	const enabled = !!bao && !!library && !!gauge
	const { data: poolInfo, refetch } = useQuery(
		['@/hooks/gauges/usePoolInfo', providerKey(library, account, chainId), { enabled, gid: gauge.gid }],
		async () => {
			const poolAddress = gauge?.poolAddresses[chainId]
			const poolInfoAddress = gauge?.poolInfoAddresses[chainId]

			const poolInfoContract = PoolInfo__factory.connect(poolInfoAddress, library)
			const univ2LpContract = Uni_v2_lp__factory.connect(poolAddress, library)
			const saddlePoolContract = SaddlePool__factory.connect(poolAddress, library)
			const balancerVault = BalancerVault__factory.connect(Config.contracts.BalancerVault[chainId].address, library)

			const lpQuery = Multicall.createCallContext([
				gauge.type.toLowerCase() === 'curve'
					? {
							contract: poolInfoContract,
							ref: gauge.poolAddress,
							calls: [
								{ method: 'get_coins', params: [gauge.poolAddress] },
								{ method: 'get_decimals', params: [gauge.poolAddress] },
								{ method: 'get_balances', params: [gauge.poolAddress] },
							],
					  }
					: gauge.type.toLowerCase() === 'uniswap'
					? {
							contract: univ2LpContract,
							ref: gauge.lpAddress,
							calls: [{ method: 'getReserves' }, { method: 'token0' }, { method: 'token1' }],
					  }
					: gauge.type.toLowerCase() === 'balancer'
					? {
							contract: balancerVault,
							ref: gauge.poolAddress,
							calls: [{ method: 'getPoolTokens', params: [gauge.balancerPoolId] }],
					  }
					: {
							contract: saddlePoolContract,
							ref: gauge.poolAddress,
							calls: [
								{ method: 'getToken', params: ['0'] },
								{ method: 'getTokenBalance', params: ['0'] },
								{ method: 'getToken', params: ['1'] },
								{ method: 'getTokenBalance', params: ['1'] },
							],
					  },
			])

			const { [gauge.poolAddress]: res0 } = Multicall.parseCallResults(await bao.multicall.call(lpQuery))

			return {
				token0Address:
					gauge.type.toLowerCase() === 'curve'
						? res0[0].values[0].toString()
						: gauge.type.toLowerCase() === 'uniswap'
						? res0[1].values[0].toString()
						: gauge.type.toLowerCase() === 'balancer'
						? res0[0].values[0][0].toString() === gauge.poolAddress
							? res0[0].values[0][1].toString() === gauge.poolAddress
								? res0[0].values[0][2].toString()
								: res0[0].values[0][1].toString()
							: res0[0].values[0][0].toString()
						: res0[0].values[0].toString(),
				token1Address:
					gauge.type.toLowerCase() === 'curve'
						? res0[0].values[1].toString()
						: gauge.type.toLowerCase() === 'uniswap'
						? res0[2].values[0].toString()
						: gauge.type.toLowerCase() === 'balancer'
						? res0[0].values[0][0].toString() === gauge.poolAddress
							? res0[0].values[0][1].toString() === gauge.poolAddress
								? res0[0].values[0][0].toString()
								: res0[0].values[0][2].toString()
							: res0[0].values[0][1].toString()
						: res0[2].values[0].toString(),
				token0Balance:
					gauge.type.toLowerCase() === 'curve'
						? res0[2].values[0].toString()
						: gauge.type.toLowerCase() === 'uniswap'
						? res0[0].values[0].toString()
						: gauge.type.toLowerCase() === 'balancer'
						? res0[0].values[0][0].toString() === gauge.poolAddress
							? res0[0].values[0][1].toString() === gauge.poolAddress
								? res0[0].values[1][2].hex.toString()
								: res0[0].values[1][1].hex.toString()
							: res0[0].values[1][0].hex.toString()
						: res0[0].values[0].toString(),
				token1Balance:
					gauge.type.toLowerCase() === 'curve'
						? res0[2].values[1].toString()
						: gauge.type.toLowerCase() === 'uniswap'
						? res0[0].values[1].toString()
						: gauge.type.toLowerCase() === 'balancer'
						? res0[0].values[0][0].toString() === gauge.poolAddress
							? res0[0].values[0][1].toString() === gauge.poolAddress
								? res0[0].values[1][0].hex.toString()
								: res0[0].values[1][2].hex.toString()
							: res0[0].values[1][1].hex.toString()
						: res0[3].values[0].toString(),
				token0Decimals: gauge.type.toLowerCase() === 'curve' ? res0[1].values[0].toString() : 18,
				token1Decimals: gauge.type.toLowerCase() === 'curve' ? res0[1].values[1].toString() : 18,
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
	console.log(gauge.symbol, poolInfo)
	return poolInfo
}

export default usePoolInfo
