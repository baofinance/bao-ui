//import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import React, { useMemo } from 'react'

import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useWeb3React } from '@web3-react/core'
import { Stabilizer__factory } from '@/typechain/factories'
import { Dai__factory } from '@/typechain/factories'

const BallastButton: React.FC<BallastButtonProps> = ({ swapDirection, inputVal, maxValues, supplyCap, reserves }: BallastButtonProps) => {
	const bao = useBao()
	const { library, chainId } = useWeb3React()
	const { handleTx } = useTransactionHandler()

	const inputAApproval = useAllowance(Config.addressMap.DAI, Config.contracts.stabilizer[Config.networkId].address)
	const inputBApproval = useAllowance(Config.addressMap.baoUSD, Config.contracts.stabilizer[Config.networkId].address)

	const handleClick = async () => {
		if (!bao || !library || !chainId) return

		const signer = library.getSigner()
		const ballast = Stabilizer__factory.connect(Config.contracts.stabilizer[chainId].address, signer)
		if (swapDirection) {
			// baoUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tx = bao.getNewContract(Config.addressMap.baoUSD, 'erc20.json', library.getSigner()).approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, 'Ballast: Approve baoUSD')
			}

			handleTx(ballast.sell(ethers.utils.parseEther(inputVal).toString()), 'Ballast: Swap baoUSD to DAI')
		} else {
			// DAI->baoUSD
			if (!inputAApproval.gt(0)) {
				const dai = Dai__factory.connect(Config.addressMap.DAI, signer)
				const tx = dai.approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, 'Ballast: Approve DAI')
			}

			handleTx(ballast.buy(ethers.utils.parseEther(inputVal).toString()), 'Ballast: Swap DAI to baoUSD')
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

	const isDisabled = useMemo(
		() =>
			inputVal === '' ||
			ethers.utils.parseEther(inputVal).gt(maxValues[swapDirection ? 'sell' : 'buy']) ||
			(swapDirection && ethers.utils.parseEther(inputVal).gt(reserves)) ||
			(!swapDirection && ethers.utils.parseEther(inputVal).gt(supplyCap)),
		[inputVal, maxValues, swapDirection, reserves, supplyCap],
	)

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
