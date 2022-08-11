import Config from 'bao/lib/config'
import { useCallback, useEffect, useState } from 'react'
import MultiCall from 'utils/multicall'
import { decimate } from 'utils/numberFormat'
import { Contract } from 'web3-eth-contract'
import useBao from '../base/useBao'
import useTransactionProvider from '../base/useTransactionProvider'
import { useWeb3React } from '@web3-react/core'
import useBlock from 'hooks/base/useBlock'

export type Balance = {
	address: string
	symbol: string
	balance: number
}

export const useAccountBalances = (): Balance[] => {
	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const { account } = useWeb3React()
	const block = useBlock()
	const tokens = Config.markets.map(market => market.underlyingAddresses[Config.networkId])

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const data: Contract[] = tokens
			.map(address => address !== 'ETH' && bao.getNewContract('erc20.json', address))
			.filter(contract => contract)

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					data.map(
						contract =>
							contract && {
								ref: contract.options.address,
								contract,
								calls: [{ method: 'symbol' }, { method: 'decimals' }, { method: 'balanceOf', params: [account] }],
							},
					),
				),
			),
		)
		const ethBalance = await bao.web3.eth.getBalance(account)

		setBalances(
			tokens.map(address => ({
				address,
				symbol: multicallResults[address] ? multicallResults[address][0].values[0] : 'ETH',
				balance: multicallResults[address]
					? decimate(multicallResults[address][2].values[0].hex, multicallResults[address][1].values[0]).toNumber()
					: decimate(ethBalance).toNumber(),
			})),
		)
	}, [transactions, bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchBalances()
	}, [transactions, bao, account, block])

	return balances
}

export const useSupplyBalances = (): Balance[] => {
	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const { account } = useWeb3React()
	const tokens = Config.markets.map(market => market.marketAddresses[Config.networkId])

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const data: Contract[] = tokens.map(address => bao.getNewContract('ctoken.json', address))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					data.map(contract => ({
						ref: contract.options.address,
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
				balance: decimate(
					multicallResults[address][1].values[0].hex,
					Config.markets.find(market => market.marketAddresses[Config.networkId] === address).underlyingDecimals, // use underlying decimals
				).toNumber(),
			})),
		)
	}, [transactions, bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchBalances()
	}, [transactions, bao, account])

	return balances
}

export const useBorrowBalances = (): Balance[] => {
	const { transactions } = useTransactionProvider()
	const bao = useBao()
	const { account } = useWeb3React()
	const tokens = Config.markets.map(market => market.marketAddresses[Config.networkId])

	const [balances, setBalances] = useState<Balance[] | undefined>()

	const fetchBalances = useCallback(async () => {
		const data: Contract[] = tokens.map(address => bao.getNewContract('ctoken.json', address))

		const multicallResults = MultiCall.parseCallResults(
			await bao.multicall.call(
				MultiCall.createCallContext(
					data.map(contract => ({
						ref: contract.options.address,
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
				balance: decimate(
					multicallResults[address][1].values[0].hex,
					Config.markets.find(market => market.marketAddresses[Config.networkId] === address).underlyingDecimals, // use underlying decimals
				).toNumber(),
			})),
		)
	}, [transactions, bao, account])

	useEffect(() => {
		if (!(bao && account)) return

		fetchBalances()
	}, [transactions, bao, account])

	return balances
}
