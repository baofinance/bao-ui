import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import Config from '@/bao/lib/config'
//import useBlock from '@/hooks/base/useBlock'
import MultiCall from '@/utils/multicall'
import { Erc20__factory, Ctoken__factory } from '@/typechain/factories'

import { formatUnits } from 'ethers/lib/utils'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'

export type Balance = {
	address: string
	symbol: string
	balance: number
}

export const useAccountBalances = (): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	//const block = useBlock()

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const tokens = Config.markets.map(market => market.underlyingAddresses[chainId])
		const contracts: Contract[] = tokens.filter(address => address !== 'ETH').map(address => Erc20__factory.connect(address, library))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					contracts.map(
						contract =>
							contract && {
								ref: contract.address,
								contract,
								calls: [{ method: 'symbol' }, { method: 'decimals' }, { method: 'balanceOf', params: [account] }],
							},
					),
				),
			),
		)
		const ethBalance = await library.getBalance(account)

		setBalances(
			tokens.map(address => {
				return {
					address,
					symbol: multicallResults[address] ? multicallResults[address][0].values[0] : 'ETH',
					// FIXME: make this .balance a bn.js for decimals or format it later in the component
					balance: multicallResults[address]
						? parseFloat(formatUnits(multicallResults[address][2].values[0], multicallResults[address][1].values[0]))
						: parseFloat(formatUnits(ethBalance)),
				}
			}),
		)
	}, [library, bao, account, chainId])

	useEffect(() => {
		if (!bao || !account || !library || !chainId) return

		fetchBalances()
	}, [fetchBalances, bao, library, account, chainId, transactions])

	return balances
}

export const useSupplyBalances = (): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const tokens = Config.markets.map(market => market.marketAddresses[chainId])
		const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					contracts.map(contract => ({
						ref: contract.address,
						contract,
						calls: [{ method: 'symbol' }, { method: 'balanceOf', params: [account] }],
					})),
				),
			),
		)

		setBalances(
			Object.keys(multicallResults).map(address => ({
				address,
				symbol: multicallResults[address][0].values[0],
				balance: parseFloat(
					formatUnits(
						multicallResults[address][1].values[0],
						Config.markets.find(market => market.marketAddresses[Config.networkId] === address).underlyingDecimals, // use underlying decimals
					),
				),
			})),
		)
	}, [bao, account, library, chainId])

	useEffect(() => {
		if (!bao || !library || !account || !chainId) return

		fetchBalances()
	}, [fetchBalances, bao, library, account, chainId, transactions])

	return balances
}

export const useBorrowBalances = (): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const tokens = Config.markets.map(market => market.marketAddresses[chainId])
		const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					contracts.map(contract => ({
						ref: contract.address,
						contract,
						calls: [{ method: 'symbol' }, { method: 'borrowBalanceStored', params: [account] }],
					})),
				),
			),
		)

		setBalances(
			Object.keys(multicallResults).map(address => ({
				address,
				symbol: multicallResults[address][0].values[0],
				balance: parseFloat(
					formatUnits(
						multicallResults[address][1].values[0],
						Config.markets.find(market => market.marketAddresses[chainId] === address).underlyingDecimals, // use underlying decimals
					),
				),
			})),
		)
	}, [bao, account, library, chainId])

	useEffect(() => {
		if (!bao || !account || !chainId || !library) return
		fetchBalances()
	}, [fetchBalances, bao, account, library, chainId, transactions])

	return balances
}
