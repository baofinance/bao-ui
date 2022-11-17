import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useContract from '@/hooks/base/useContract'
import type { BaoDistribution } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { exponentiate } from '@/utils/numberFormat'

const useAccountDistribution = () => {
	const { library, account, chainId } = useWeb3React()
	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const enabled = !!library && !!account && !!distribution

	const { data: accountDistribution, refetch } = useQuery(
		['@/hooks/distribution/useAccountDistribution', providerKey(library, account, chainId)],
		async () => {
			// assming the user's distribution was started sometime in the past
			const info = await distribution.distributions(account)
			const claimable = await distribution.claimable(account, 0)
			const dateStarted = info.dateStarted.mul(1000).toNumber()
			const dateNow = (await library.getBlock()).timestamp * 1000
			const daysDiff = Math.floor((dateNow - dateStarted) / 86400000)
			const curve = await distribution.distCurve(info.amountOwedTotal, exponentiate(BigNumber.from(daysDiff)))
			return { info, claimable, curve }
		},
		{
			enabled,
			placeholderData: {
				info: undefined,
				claimable: undefined,
				curve: undefined,
			},
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return accountDistribution
}

export default useAccountDistribution
