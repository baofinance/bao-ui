import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'
import useTransactionHandler from '../base/useTransactionHandler'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

type GaugeInfo = {
	totalSupply: BigNumber
	inflationRate: BigNumber
	balance: BigNumber
	workingBalance: BigNumber
	claimableTokens: BigNumber
	integrateFraction: BigNumber
	lpToken: string
	workingSupply: BigNumber
}

const useGaugeInfo = (gauge: ActiveSupportedGauge): GaugeInfo => {
	const { library, account, chainId } = useWeb3React()
	const bao = useBao()
	const { txSuccess } = useTransactionHandler()

	const { data: gaugeInfo, refetch } = useQuery(
		['@/hooks/vebao/useGaugeInfo', providerKey(library, account, chainId), gauge.gaugeContract.address],
		async () => {
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
						{
							method: 'lp_token',
						},
						{
							method: 'working_supply',
						},
					],
				},
			])

			const { gauge: res } = Multicall.parseCallResults(await bao.multicall.call(query))

			return {
				totalSupply: res[0].values[0],
				inflationRate: res[1].values[0],
				balance: res[2].values[0],
				workingBalance: res[3].values[0],
				claimableTokens: res[4].values[0],
				integrateFraction: res[5].values[0],
				lpToken: res[6].values[0],
				workingSupply: res[7].values[0],
			}
		},
		{
			enabled: !!bao && !!account && !!gauge,
		},
	)

	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	return gaugeInfo
}

export default useGaugeInfo
