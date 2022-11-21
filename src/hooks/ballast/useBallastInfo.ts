import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Dai } from '@/typechain/Dai'
import { Stabilizer } from '@/typechain/Stabilizer'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
import useContract from '../base/useContract'

type BallastInfo = {
	supplyCap: BigNumber
	buyFee: BigNumber
	sellFee: BigNumber
	feeDenom: BigNumber
	reserves: BigNumber
}

const useBallastInfo = (): BallastInfo => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const ballast = useContract<Stabilizer>('Stabilizer')
	const dai = useContract<Dai>('Dai')

	const { data: ballastInfo, refetch } = useQuery(
		['@/hooks/vebao/useBallastInfo', providerKey(library, account, chainId)],
		async () => {
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

			return {
				supplyCap: BigNumber.from(ballastRes[1].values[0]),
				buyFee: BigNumber.from(ballastRes[1].values[0]),
				sellFee: BigNumber.from(ballastRes[2].values[0]),
				feeDenom: BigNumber.from(ballastRes[3].values[0]),
				reserves: BigNumber.from(daiRes[0].values[0]),
			}
		},
		{
			enabled: !!bao && !!account,
		},
	)

	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	return ballastInfo
}

export default useBallastInfo
