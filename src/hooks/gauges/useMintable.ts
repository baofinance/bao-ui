import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import Config from '@/bao/lib/config'
import useContract from '@/hooks/base/useContract'
import type { Baov2 } from '@/typechain/index'
import useEpochTime from './useEpochTime'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

const useMintable = () => {
	const { library, account, chainId } = useWeb3React()
	const epochTime = useEpochTime()
	const token = useContract<Baov2>('Baov2', Config.contracts.Baov2[chainId].address)

	const enabled = !!account && !!epochTime && !!epochTime.start && !!epochTime.future && !!token
	const { data: mintable, refetch } = useQuery(
		['@/hooks/gauges/useMintable', providerKey(library, account, chainId), { enabled, epochTime }],
		async () => {
			const _mintable = await token.mintable_in_timeframe(epochTime.start, epochTime.future)
			return _mintable
		},
		{
			enabled,
			placeholderData: BigNumber.from(0),
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return mintable
}

export default useMintable
