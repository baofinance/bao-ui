import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'

const useProofs = () => {
	const { account } = useWeb3React()

	const enabled = !!account
	const { data: merkleLeaf } = useQuery(
		['@/hooks/distribution/useProofs', { enabled, account }],
		async () => {
			const leafResponse = await fetch(`https://bao-distribution-api.herokuapp.com/${account}`)
			if (leafResponse.status !== 200) {
				const { error } = await leafResponse.json()
				throw new Error(`${error.code} - ${error.message}`)
			}
			const leaf = await leafResponse.json()
			return leaf
		},
		{
			enabled,
			retry: false,
			staleTime: Infinity,
			cacheTime: Infinity,
		},
	)

	return merkleLeaf
}

export default useProofs
