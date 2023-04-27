import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import useBao from '../base/useBao'
import { useAccountLiquidity } from './useAccountLiquidity'
import { useVaultPrices } from './usePrices'
import { useAccountVaults } from './useVaults'
import { exponentiate } from '@/utils/numberFormat'

const useHealthFactor = (vaultName: string, borrowChange: BigNumber) => {
	const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>()
	const bao = useBao()
	const { account } = useWeb3React()
	const vaults = useAccountVaults(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)
	const { prices } = useVaultPrices(vaultName)

	const fetchHealthFactor = useCallback(async () => {
		const usdBorrow = BigNumber.from(parseUnits(accountLiquidity.usdBorrow.toString()))
		const _vaults = vaults.filter(vault => vault && !vault?.isSynth)

		const balanceQuery = Multicall.createCallContext(
			_vaults.map(vault => ({
				contract: vault.vaultContract,
				ref: vault.vaultAddress,
				calls: [{ method: 'balanceOfUnderlying', params: [account] }],
			})),
		)
		const balanceRes = Multicall.parseCallResults(await bao.multicall.call(balanceQuery))

		if (Object.keys(balanceRes).length === 0) return setHealthFactor(BigNumber.from(0))

		const collateralSummation = _vaults.reduce((prev, cur) => {
			return prev.add(
				BigNumber.from(prices[cur.vaultAddress])
					.div(BigNumber.from(10).pow(36 - cur.underlyingDecimals))
					.mul(parseUnits(balanceRes[cur.vaultAddress][0].values[0].toString()))
					.div(BigNumber.from(10).pow(cur.underlyingDecimals))
					.mul(parseUnits(cur.collateralFactor.toString())),
			)
		}, BigNumber.from(0))

		try {
			const _healthFactor = collateralSummation.div(exponentiate(borrowChange).toString())
			setHealthFactor(_healthFactor)
		} catch {
			setHealthFactor(BigNumber.from(0))
		}
	}, [accountLiquidity, vaults, bao, account, prices, borrowChange])

	useEffect(() => {
		if (!(vaults && accountLiquidity && bao && account && prices)) return

		fetchHealthFactor()
	}, [vaults, accountLiquidity, bao, account, prices, fetchHealthFactor, borrowChange])

	return healthFactor
}

export default useHealthFactor
