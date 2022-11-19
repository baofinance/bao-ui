import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { providerKey } from '@/utils/index'
import { exponentiate } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
import useContract from '../base/useContract'
import useTransactionHandler from '../base/useTransactionHandler'

type DistributionInfo = {
	dateStarted: BigNumber
	dateEnded: BigNumber
	lastClaim: BigNumber
	amountOwedTotal: BigNumber
	claimable: BigNumber
	curve: BigNumber
}

const useDistribtuionInfo = (): DistributionInfo => {
	const { library, account, chainId } = useWeb3React()
	const bao = useBao()
	const { txSuccess } = useTransactionHandler()
	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const enabled = !!bao && !!account && !!distribution
	const { data: distributionInfo, refetch } = useQuery(
		['@/hooks/vebao/useAccountDistribution', providerKey(library, account, chainId)],
		async () => {
			const info = distribution ? await distribution.distributions(account) : null
			const claimable = distribution ? await distribution.claimable(account, 0) : null
			const block = await library?.getBlock()
			const dateStarted = info.dateStarted.mul(1000).toNumber()
			const dateNow = block.timestamp * 1000
			const daysDiff = Math.floor((dateNow - dateStarted) / 86400000)
			const curve = distribution ? await distribution.distCurve(info.amountOwedTotal, exponentiate(BigNumber.from(daysDiff))) : null

			return {
				dateStarted: info ? info.dateStarted : BigNumber.from(0),
				dateEnded: info ? info.dateEnded : BigNumber.from(0),
				lastClaim: info ? info.lastClaim : BigNumber.from(0),
				amountOwedTotal: info ? info.amountOwedTotal : BigNumber.from(0),
				claimable: claimable ? claimable : BigNumber.from(0),
				curve: curve ? curve : BigNumber.from(0),
			}
		},
		{
			enabled,
			placeholderData: {
				dateStarted: BigNumber.from(0),
				dateEnded: BigNumber.from(0),
				lastClaim: BigNumber.from(0),
				amountOwedTotal: BigNumber.from(0),
				claimable: BigNumber.from(0),
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

export default useDistribtuionInfo
