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

const BallastButton: React.FC<BallastButtonProps> = ({ swapDirection, inputVal, maxValues, supplyCap, reserves }: BallastButtonProps) => {
	const { handleTx } = useTransactionHandler()

	const { chainId } = useWeb3React()

	const inputAApproval = useAllowance(Config.addressMap.DAI, Config.contracts.Stabilizer[chainId].address)
	const inputBApproval = useAllowance(Config.addressMap.baoUSD, Config.contracts.Stabilizer[chainId].address)

	const ballast = useContract<Stabilizer>('Stabilizer')
	const dai = useContract<Dai>('Dai')
	const baoUSD = useContract<Erc20>('Erc20', Config.addressMap.baoUSD)

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
			if (!inputBApproval.gt(0)) {
				const tx = baoUSD.approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, 'Ballast: Approve baoUSD')
			}

			handleTx(ballast.sell(parseUnits(inputVal).toString()), 'Ballast: Swap baoUSD to DAI')
		} else {
			// DAI->baoUSD
			if (!inputAApproval.gt(0)) {
				const tx = dai.approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, 'Ballast: Approve DAI')
			}

			handleTx(ballast.buy(parseUnits(inputVal).toString()), 'Ballast: Swap DAI to baoUSD')
		}
	}

	const buttonText = () => {
		if (!(inputAApproval && inputBApproval)) return <Loader />
		if (swapDirection) {
			return inputBApproval.gt(0) ? 'Swap baoUSD for DAI' : 'Approve baoUSD'
		} else {
			return inputAApproval.gt(0) ? 'Swap DAI for baoUSD' : 'Approve DAI'
		}
	}

	return (
		<Button fullWidth onClick={handleClick} disabled={isDisabled}>
			{buttonText()}
		</Button>
	)
}

type BallastButtonProps = {
	swapDirection: boolean
	inputVal: string
	maxValues: { [key: string]: BigNumber }
	supplyCap: BigNumber
	reserves: BigNumber
}

export default BallastButton
