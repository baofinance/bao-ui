import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import React, { useMemo } from 'react'
import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import useAllowance from '@/hooks/base/useAllowance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useContract from '@/hooks/base/useContract'
import type { Stabilizer, Dai, Erc20 } from '@/typechain/index'

const BallastButton: React.FC<BallastButtonProps> = ({
	vaultName,
	swapDirection,
	inputVal,
	maxValues,
	supplyCap,
	reserves,
}: BallastButtonProps) => {
	const { handleTx } = useTransactionHandler()
	const ballast = useContract<Stabilizer>('Stabilizer', Config.vaults[vaultName].stabilizer)
	const daiApproval = useAllowance(Config.addressMap.DAI, ballast.address)
	const wethApproval = useAllowance(Config.addressMap.WETH, ballast.address)
	const baoUSDApproval = useAllowance(Config.addressMap.baoUSD, ballast.address)
	const baoETHApproval = useAllowance(Config.addressMap.baoETH, ballast.address)
	const dai = useContract<Dai>('Dai', Config.addressMap.DAI)
	const weth = useContract<Dai>('Weth', Config.addressMap.WETH)
	const baoUSD = useContract<Erc20>('Erc20', Config.addressMap.baoUSD)
	const baoETH = useContract<Erc20>('Erc20', Config.addressMap.baoETH)

	const isDisabled = useMemo(
		() =>
			inputVal === '' ||
			!parseUnits(inputVal).gt(0) ||
			parseUnits(inputVal).gt(maxValues[swapDirection ? 'sell' : 'buy']) ||
			(swapDirection && parseUnits(inputVal).gt(reserves)) ||
			(!swapDirection && parseUnits(inputVal).gt(supplyCap)),
		[inputVal, maxValues, swapDirection, reserves, supplyCap],
	)

	const handleClick = async () => {
		if (isDisabled) return
		if (swapDirection) {
			// baoUSD->DAI
			if (vaultName === 'baoUSD' ? !baoUSDApproval.gt(0) : !baoETHApproval.gt(0)) {
				const tx = (vaultName === 'baoUSD' ? baoUSD : baoETH).approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, `Ballast: Approve ${vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}`)
			}

			handleTx(
				ballast.sell(parseUnits(inputVal).toString()),
				`Ballast: Swap ${vaultName === 'baoUSD' ? 'baoUSD for DAI' : 'baoETH for ETH'}`,
			)
		} else {
			// DAI->baoUSD
			if (vaultName === 'baoUSD' ? !daiApproval.gt(0) : !wethApproval.gt(0)) {
				const tx = (vaultName === 'baoUSD' ? dai : weth).approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, `Ballast: Approve ${vaultName === 'baoUSD' ? 'DAI' : 'WETH'}`)
			}

			handleTx(
				ballast.buy(parseUnits(inputVal).toString()),
				`Ballast: Swap ${vaultName === 'baoUSD' ? 'DAI for baoUSD' : 'WETH for baoETH'}`,
			)
		}
	}

	const buttonText = () => {
		if (!(daiApproval && baoUSDApproval && wethApproval)) return <Loader />
		if (vaultName === 'baoUSD')
			if (swapDirection) {
				return baoUSDApproval.gt(0) ? 'Swap baoUSD for DAI' : 'Approve baoUSD'
			} else {
				return daiApproval.gt(0) ? 'Swap DAI for baoUSD' : 'Approve DAI'
			}
		if (vaultName === 'baoETH')
			if (swapDirection) {
				return baoETHApproval.gt(0) ? 'Swap baoETH for ETH' : 'Approve baoETH'
			} else {
				return wethApproval.gt(0) ? 'Swap WETH for baoETH' : 'Approve WETH'
			}
	}

	return (
		<Button fullWidth onClick={handleClick} disabled={isDisabled}>
			{buttonText()}
		</Button>
	)
}

type BallastButtonProps = {
	vaultName: string
	swapDirection: boolean
	inputVal: string
	maxValues: { [key: string]: BigNumber }
	supplyCap: BigNumber
	reserves: BigNumber
}

export default BallastButton
