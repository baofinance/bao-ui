import Config from 'bao/lib/config'
import { useCallback, useEffect, useState } from 'react'
import useBao from './useBao'

const useIsConnected = (): boolean => {
	const bao = useBao()
	const [hasAccounts, setHasAccounts] = useState<boolean | undefined>()

	const fetchIsConnected = useCallback(async () => {
		const chainId = await bao.web3.eth.getChainId()
		setHasAccounts((await bao.hasAccounts()) && chainId === Config.networkId)
	}, [bao])

	useEffect(() => {
		if (bao && bao.web3) fetchIsConnected()
	}, [bao])

	return hasAccounts
}

export default useIsConnected
