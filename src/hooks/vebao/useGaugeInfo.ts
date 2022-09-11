import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'

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
			totalSupply: new BigNumber(res[0].values[0].hex),
			inflationRate: new BigNumber(res[1].values[0].hex),
			balance: new BigNumber(res[2].values[0].hex),
			workingBalance: new BigNumber(res[3].values[0].hex),
			claimableTokens: new BigNumber(res[4].values[0].hex),
			integrateFraction: new BigNumber(res[5].values[0].hex),
		})
	}, [bao, gauge])

	useEffect(() => {
		if (!(bao && gauge)) return

		fetchGaugeInfo()
	}, [bao, gauge])

	return gaugeInfo
}

export default useGaugeInfo
