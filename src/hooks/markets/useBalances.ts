import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import Config from '@/bao/lib/config'
import useBlock from '@/hooks/base/useBlock'
import MultiCall from '@/utils/multicall'

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
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const block = useBlock()
	const tokens = Config.markets.map(market => market.underlyingAddresses[Config.networkId])

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const data: Contract[] = tokens
			.map(address => address !== 'ETH' && bao.getNewContract(address, 'erc20.json'))
			.filter(contract => contract)

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					data.map(
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
		const ethBalance = await bao.provider.getBalance(account)

		setBalances(
			tokens.map(address => {
				return {
					address,
					symbol: multicallResults[address] ? multicallResults[address][0].values[0] : 'ETH',
					balance: multicallResults[address]
						? parseFloat(formatUnits(multicallResults[address][2].values[0], multicallResults[address][1].values[0]))
						: parseFloat(formatUnits(ethBalance)),
				}
			}),
		)
	}, [tokens, bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchBalances()
	}, [bao, account, block, transactions])

	return balances
}

export const useSupplyBalances = (): Balance[] => {
	const bao = useBao()
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const tokens = Config.markets.map(market => market.marketAddresses[Config.networkId])

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const data: Contract[] = tokens.map(address => bao.getNewContract(address, 'ctoken.json'))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					data.map(contract => ({
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
	}, [bao, account, tokens])

	useEffect(() => {
		if (!(bao && account)) return

		fetchBalances()
	}, [bao, account, transactions])

	return balances
}

export const useBorrowBalances = (): Balance[] => {
	const bao = useBao()
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const tokens = Config.markets.map(market => market.marketAddresses[Config.networkId])

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const data: Contract[] = tokens.map(address => bao.getNewContract(address, 'ctoken.json'))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					data.map(contract => ({
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
						Config.markets.find(market => market.marketAddresses[Config.networkId] === address).underlyingDecimals, // use underlying decimals
					),
				),
			})),
		)
	}, [tokens, bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchBalances()
	}, [bao, account, transactions])

	return balances
}
