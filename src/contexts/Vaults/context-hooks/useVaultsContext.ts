import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { Cether__factory, Comptroller__factory, Ctoken__factory, Erc20__factory, VaultOracle__factory } from '@/typechain/factories'
import type { Cether, Ctoken } from '@/typechain/index'
import { decimate, exponentiate } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'

type Cvault = Cether | Ctoken

export const SECONDS_PER_BLOCK = 12
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: BigNumber) => ((Math.pow((rate.toNumber() / 1e18) * BLOCKS_PER_DAY + 1, DAYS_PER_YEAR) - 1) * 100).toFixed(18)

export const useVaultsContext = (): { [vaultName: string]: ActiveSupportedVault[] } | undefined => {
	const { library, account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [vaults, setVaults] = useState<{ [vaultName: string]: ActiveSupportedVault[] }>({})

	const fetchVaults = useCallback(
		async (vaultName: string) => {
			const signerOrProvider = account ? library.getSigner() : library
			const _vaults = Config.vaults[vaultName].markets
				.filter(vault => !vault.archived) // TODO- add in option to view archived vaults
				.map(vault => {
					const vaultAddress = vault.vaultAddresses[chainId]
					const underlyingAddress = vault.underlyingAddresses[chainId]
					let vaultContract
					if (underlyingAddress === 'ETH') vaultContract = Cether__factory.connect(vaultAddress, signerOrProvider)
					else vaultContract = Ctoken__factory.connect(vaultAddress, signerOrProvider)
					let underlyingContract
					if (underlyingAddress !== 'ETH') underlyingContract = Erc20__factory.connect(underlyingAddress, signerOrProvider)
					return Object.assign(vault, {
						vaultAddress,
						vaultContract,
						underlyingAddress,
						underlyingContract,
					})
				})

			const comptroller = Comptroller__factory.connect(Config.vaults[vaultName].comptroller, signerOrProvider)
			const oracle = VaultOracle__factory.connect(Config.vaults[vaultName].oracle, signerOrProvider)

			const contracts: Cvault[] = _vaults.map((vault: ActiveSupportedVault) => {
				return vault.vaultContract
			})

			// FIXME: this should be one multicall per contract instead of HELLA ethereum rpc calls
			const [
				reserveFactors,
				totalReserves,
				totalBorrows,
				supplyRates,
				borrowRates,
				cashes,
				vaultsInfo,
				totalSupplies,
				exchangeRates,
				borrowState,
				symbols,
				underlyingSymbols,
				liquidationIncentive,
				borrowRestricted,
				prices,
			] = await Promise.all([
				Promise.all(contracts.map(contract => contract.reserveFactorMantissa())),
				Promise.all(contracts.map(contract => contract.totalReserves())),
				Promise.all(contracts.map(contract => contract.totalBorrows())),
				Promise.all(contracts.map(contract => contract.supplyRatePerBlock())),
				Promise.all(contracts.map(contract => contract.borrowRatePerBlock())),
				Promise.all(contracts.map(contract => contract.getCash())),
				Promise.all(contracts.map(contract => comptroller.callStatic.markets(contract.address))),
				Promise.all(contracts.map(contract => contract.totalSupply())),
				Promise.all(contracts.map(contract => contract.callStatic.exchangeRateCurrent())),
				Promise.all(contracts.map(contract => comptroller.callStatic.compBorrowState(contract.address))),
				Promise.all(contracts.map(contract => contract.symbol())),
				Promise.all(_vaults.map(vault => (vault.underlyingContract ? vault.underlyingContract.symbol() : 'ETH'))),
				comptroller.callStatic.liquidationIncentiveMantissa(),
				Promise.all(contracts.map(vault => comptroller.callStatic.borrowRestricted(vault.address))),
				Promise.all(contracts.map(vault => oracle.callStatic.getUnderlyingPrice(vault.address))),
			])

			const supplyApys: BigNumber[] = supplyRates.map((rate: BigNumber) => parseUnits(toApy(rate).toString()))
			const borrowApys: BigNumber[] = borrowRates.map((rate: BigNumber) => parseUnits(toApy(rate).toString()))

			const newVaults: ActiveSupportedVault[] = contracts.map((contract, i) => {
				const vaultConfig = _vaults.find(vault => vault.vaultAddresses[chainId] === contract.address)
				return {
					symbol: symbols[i],
					underlyingSymbol: underlyingSymbols[i],
					supplyApy: supplyApys[i],
					borrowApy: borrowApys[i],
					liquidity: cashes[i],
					totalReserves: totalReserves[i],
					totalBorrows: totalBorrows[i],
					collateralFactor: vaultsInfo[i][1],
					imfFactor: vaultsInfo[i][2],
					reserveFactor: reserveFactors[i],
					supplied: decimate(exchangeRates[i].mul(totalSupplies[i])),
					borrowable: borrowState[i][1] > 0,
					liquidationIncentive: decimate(liquidationIncentive.mul(10).sub(exponentiate(1))),
					borrowRestricted: borrowRestricted[i],
					price: prices[i],
					...vaultConfig,
				}
			})

			setVaults((ms: any) => {
				ms[vaultName] = newVaults
				return ms
			})
		},
		[chainId, library, account],
	)

	useEffect(() => {
		if (!library || !chainId) return
		fetchVaults('baoUSD')
		fetchVaults('baoETH')
	}, [fetchVaults, library, account, chainId, transactions])

	// DIRTY FIX TO SHOW VAULTS ON INITIALIZATION
	const [initialized, setInitialized] = useState(false)
	const dirtyFix_reRender = () => {
		setInitialized(!initialized)
	}
	useEffect(() => {
		dirtyFix_reRender()
	}, [initialized])
	// END OF DIRTY TRICK

	return vaults
}
