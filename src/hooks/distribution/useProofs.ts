import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'

const useProofs = () => {
	const { account } = useWeb3React()

	const proofsUrl = `https://bao-distribution-api.herokuapp.com/${account}`

	const { data: merkleLeaf } = useQuery(
		[proofsUrl],
		async () => {
			const leafResponse = await fetch(proofsUrl)
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
