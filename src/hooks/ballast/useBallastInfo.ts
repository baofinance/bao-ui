import Config from '@/bao/lib/config'
import { Dai, Stabilizer } from '@/typechain/index'
import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import useContract from '../base/useContract'
import useTransactionProvider from '../base/useTransactionProvider'

const useBallastInfo = () => {
	const bao = useBao()
	const { account, chainId } = useWeb3React()
	const [reserves, setReserves] = useState<BigNumber | undefined>()
	const [supplyCap, setSupplyCap] = useState<BigNumber | undefined>()
	const [fees, setFees] = useState<{ [key: string]: BigNumber } | undefined>()
	const ballast = useContract<Stabilizer>('Stabilizer', Config.contracts.Stabilizer[chainId].address)
	const dai = useContract<Dai>('Dai', Config.contracts.Dai[chainId].address)
	const { transactions } = useTransactionProvider()

	const fetchBallastInfo = useCallback(async () => {
		const ballastQueries = Multicall.createCallContext([
			{
				ref: 'Ballast',
				contract: ballast,
				calls: [{ method: 'supplyCap' }, { method: 'buyFee' }, { method: 'sellFee' }, { method: 'FEE_DENOMINATOR' }],
			},
			{
				ref: 'DAI',
				contract: dai,
				calls: [{ method: 'balanceOf', params: [ballast.address] }],
			},
		])
		const { Ballast: ballastRes, DAI: daiRes } = Multicall.parseCallResults(await bao.multicall.call(ballastQueries))

		setSupplyCap(BigNumber.from(ballastRes[0].values[0]))
		setFees({
			buy: BigNumber.from(ballastRes[1].values[0]),
			sell: BigNumber.from(ballastRes[2].values[0]),
			denominator: BigNumber.from(ballastRes[3].values[0]),
		})
		setReserves(BigNumber.from(daiRes[0].values[0]))
	}, [bao, ballast, dai])

	useEffect(() => {
		if (!bao || !ballast || !dai) return
		fetchBallastInfo()
	}, [bao, ballast, dai, fetchBallastInfo, transactions])

	return { reserves, supplyCap, fees }
}

export default useBallastInfo
