import Config from '@/bao/lib/config'
import { Dai, Stabilizer } from '@/typechain/index'
import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useBallastInfo = () => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const ballast = useContract<Stabilizer>('Stabilizer', Config.contracts.Stabilizer[chainId].address)
	const dai = useContract<Dai>('Dai', Config.contracts.Dai[chainId].address)

	const enabled = !!bao && !!library && !!ballast && !!dai
	const { data: ballastInfo, refetch } = useQuery(
		['@/hooks/ballast/useBallastInfo', providerKey(library, account, chainId), ballast?.address, dai?.address],
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
				reserves: BigNumber.from(daiRes[0].values[0]),
				supplyCap: BigNumber.from(ballastRes[0].values[0]),
				fees: {
					buy: BigNumber.from(ballastRes[1].values[0]),
					sell: BigNumber.from(ballastRes[2].values[0]),
					denominator: BigNumber.from(ballastRes[3].values[0]),
				},
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

	return ballastInfo
}

export default useBallastInfo
