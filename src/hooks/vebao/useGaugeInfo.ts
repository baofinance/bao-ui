import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'
import useTransactionHandler from '../base/useTransactionHandler'

type GaugeInfo = {
	totalSupply: BigNumber
	inflationRate: BigNumber
	balance: BigNumber
	workingBalance: BigNumber
	claimableTokens: BigNumber
	integrateFraction: BigNumber
}

const useGaugeInfo = (gauge: ActiveSupportedGauge): GaugeInfo => {
	const [gaugeInfo, setGaugeInfo] = useState<GaugeInfo | undefined>()
	const bao = useBao()
	const { account } = useWeb3React()
	const { txSuccess } = useTransactionHandler()

	const fetchGaugeInfo = useCallback(async () => {
		const gaugeContract = gauge.gaugeContract
		const query = Multicall.createCallContext([
			{
				contract: gaugeContract,
				ref: 'gauge',
				calls: [
					{
						method: 'totalSupply',
					},
					{
						method: 'inflation_rate',
					},
					{
						method: 'balanceOf',
						params: [account],
					},
					{
						method: 'working_balances',
						params: [account],
					},
					{
						method: 'claimable_tokens',
						params: [account],
					},
					{
						method: 'integrate_fraction',
						params: [account],
					},
				],
			},
		])

		const { gauge: res } = Multicall.parseCallResults(await bao.multicall.call(query))

		setGaugeInfo({
			totalSupply: res[0].values[0],
			inflationRate: res[1].values[0],
			balance: res[2].values[0],
			workingBalance: res[3].values[0],
			claimableTokens: res[4].values[0],
			integrateFraction: res[5].values[0],
		})
	}, [bao, gauge])

	useEffect(() => {
		if (!(bao && gauge)) return

		fetchGaugeInfo()
	}, [bao, gauge, txSuccess])

	return gaugeInfo
}

export default useGaugeInfo
