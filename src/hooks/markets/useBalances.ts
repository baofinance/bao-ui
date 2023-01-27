import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import Config from '@/bao/lib/config'
//import useBlock from '@/hooks/base/useBlock'
import MultiCall from '@/utils/multicall'
import { Erc20__factory, Ctoken__factory } from '@/typechain/factories'
import useBao from '@/hooks/base/useBao'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export type Balance = {
	address: string
	symbol: string
	balance: BigNumber
	decimals: number
}

export const useAccountBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId
	const { data: balances, refetch } = useQuery(
		['@/hooks/markets/useAccountBalances', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const tokens = Config.markets[marketName].markets.map(market => market.underlyingAddresses[chainId])
			const contracts: Contract[] = tokens.filter(address => address !== 'ETH').map(address => Erc20__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
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

			return tokens.map(address => {
				const symbol = res[address] ? res[address][0].values[0] : 'ETH'
				const decimals = res[address] ? res[address][1].values[0] : 18
				const balance = res[address] ? res[address][2].values[0] : ethBalance
				// FIXME: make this .balance a bn.js for decimals or format it later in the component
				return { address, symbol, balance, decimals }
			})
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return balances
}

export const useSupplyBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId
	const { data: balances, refetch } = useQuery(
		['@/hooks/markets/useSupplyBalances', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const tokens = Config.markets[marketName].markets.map(market => market.marketAddresses[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
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

			return Object.keys(res).map(address => {
				const decimals = Config.markets[marketName].markets.find(market => market.marketAddresses[chainId] === address).underlyingDecimals
				return {
					address,
					symbol: res[address][0].values[0],
					balance: res[address][1].values[0],
					decimals,
				}
			})
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return balances
}

export const useBorrowBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId
	const { data: balances, refetch } = useQuery(
		['@/hooks/markets/useBorrowBalances', providerKey(library, account, chainId), { enabled, marketName }],
		async () => {
			const tokens = Config.markets[marketName].markets.map(market => market.marketAddresses[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
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

			return Object.keys(res).map(address => {
				const decimals = Config.markets[marketName].markets.find(market => market.marketAddresses[chainId] === address).underlyingDecimals
				return {
					address,
					symbol: res[address][0].values[0],
					balance: res[address][1].values[0],
					decimals,
				}
			})
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return balances
}
