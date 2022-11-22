import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { providerKey } from '@/utils/index'
import { exponentiate } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useContract from '../base/useContract'

type DistributionInfo = {
	dateStarted: BigNumber
	dateEnded: BigNumber
	lastClaim: BigNumber
	amountOwedTotal: BigNumber
	curve: BigNumber
}

const useDistributionInfo = (): DistributionInfo => {
	const { library, account, chainId } = useWeb3React()
	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const enabled = !!library && !!account && !!distribution
	const { data: distributionInfo, refetch } = useQuery(
		['@/hooks/vebao/useAccountDistribution', providerKey(library, account, chainId)],
		async () => {
			const { dateStarted, dateEnded, lastClaim, amountOwedTotal } = await distribution.distributions(account)
			const timeStarted = dateStarted.mul(1000).toNumber()
			const block = await library.getBlock()
			const timeNow = block.timestamp * 1000
			const daysDiff = Math.floor((timeNow - timeStarted) / 86400000)
			const curve = await distribution.distCurve(amountOwedTotal, exponentiate(BigNumber.from(daysDiff)))

			return {
				dateStarted,
				dateEnded,
				lastClaim,
				amountOwedTotal,
				curve,
			}
		},
		{
			enabled,
			placeholderData: {
				dateStarted: BigNumber.from(0),
				dateEnded: BigNumber.from(0),
				lastClaim: BigNumber.from(0),
				amountOwedTotal: BigNumber.from(0),
				curve: BigNumber.from(0),
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return distributionInfo
}

export default useDistributionInfo
