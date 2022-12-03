import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'

const useProofs = () => {
	const { account, chainId } = useWeb3React()

	const { data: merkleLeaf } = useQuery(
		['/api/vebao/distribution/proof', account, chainId],
		async () => {
			const leafResponse = await fetch(`/api/vebao/distribution/proof/${account}/`)
			if (leafResponse.status !== 200) {
				const { error } = await leafResponse.json()
				throw new Error(`${error.code} - ${error.message}`)
			}
			const leaf = await leafResponse.json()
			return leaf
		},
		{
			retry: false,
			enabled: !!account,
			staleTime: Infinity,
			cacheTime: Infinity,
		},
	)

	return merkleLeaf
}

export default useProofs
