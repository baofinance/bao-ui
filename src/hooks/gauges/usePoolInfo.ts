import { PoolInfo__factory, Uni_v2_lp__factory } from '@/typechain/index'
import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers/lib/ethers'
import { useCallback, useEffect, useState } from 'react'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'
import useTransactionHandler from '../base/useTransactionHandler'

type PoolInfoTypes = {
	token0Address: string
	token1Address: string
	token0Decimals: BigNumber
	token1Decimals: BigNumber
	token0Balance: BigNumber
	token1Balance: BigNumber
}

const usePoolInfo = (gauge: ActiveSupportedGauge): PoolInfoTypes => {
	const [poolInfo, setPoolInfo] = useState<PoolInfoTypes | undefined>()
	const bao = useBao()
	const { account, chainId, library } = useWeb3React()
	const { txSuccess } = useTransactionHandler()

	const fetchPoolInfo = useCallback(async () => {
		const signerOrProvider = account ? library.getSigner() : library
		const poolAddress = gauge?.poolAddresses[chainId]
		const poolInfoAddress = gauge?.poolInfoAddresses[chainId]

		const poolInfoContract = PoolInfo__factory.connect(poolInfoAddress, signerOrProvider)
		const univ2LpContract = Uni_v2_lp__factory.connect(poolAddress, signerOrProvider)
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
				: {
						contract: univ2LpContract,
						ref: gauge.lpAddress,
						calls: [{ method: 'getReserves' }, { method: 'token0' }, { method: 'token1' }],
				  },
		])

		const { [gauge?.poolAddress]: res0 } = Multicall.parseCallResults(await bao.multicall.call(lpQuery))

		setPoolInfo({
			token0Address: gauge?.type.toLowerCase() === 'curve' ? res0[0].values[0].toString() : res0[1].values[0].toString(),
			token1Address: gauge?.type.toLowerCase() === 'curve' ? res0[0].values[1].toString() : res0[2].values[0].toString(),
			token0Balance: gauge?.type.toLowerCase() === 'curve' ? res0[2].values[0].toString() : res0[0].values[0].toString(),
			token1Balance: gauge?.type.toLowerCase() === 'curve' ? res0[2].values[1].toString() : res0[0].values[1].toString(),
			token0Decimals: gauge?.type.toLowerCase() === 'curve' ? res0[1].values[0].toString() : 18,
			token1Decimals: gauge?.type.toLowerCase() === 'curve' ? res0[1].values[1].toString() : 18,
		})
	}, [account, library, gauge, chainId, bao.multicall])

	useEffect(() => {
		if (!(bao && account && gauge)) return
		fetchPoolInfo()
	}, [bao, account, gauge, txSuccess])

	return poolInfo
}

export default usePoolInfo
