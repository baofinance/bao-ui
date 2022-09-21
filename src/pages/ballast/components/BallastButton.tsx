//import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import React, { useMemo } from 'react'

import Config from '@/bao/lib/config'
import { approve } from '@/bao/utils'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { decimate, exponentiate } from '@/utils/numberFormat'

const BallastButton: React.FC<BallastButtonProps> = ({ swapDirection, inputVal, maxValues, supplyCap, reserves }: BallastButtonProps) => {
	const bao = useBao()
	//const { account } = useWeb3React()
	const { handleTx } = useTransactionHandler()

	const inputAApproval = useAllowance(Config.addressMap.DAI, Config.contracts.stabilizer[Config.networkId].address)
	const inputBApproval = useAllowance(Config.addressMap.baoUSD, Config.contracts.stabilizer[Config.networkId].address)

	const handleClick = async () => {
		if (!bao) return

		const ballastContract = bao.getContract('stabilizer')
		if (swapDirection) {
			// baoUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tokenContract = bao.getNewContract(Config.addressMap.baoUSD, 'erc20.json')
				return handleTx(approve(tokenContract, ballastContract), 'Ballast: Approve baoUSD')
			}

			handleTx(ballastContract.sell(exponentiate(inputVal).toString()), 'Ballast: Swap baoUSD to DAI')
		} else {
			// DAI->baoUSD
			if (!inputAApproval.gt(0)) {
				const tokenContract = bao.getNewContract(Config.addressMap.DAI, 'erc20.json')
				return handleTx(approve(tokenContract, ballastContract), 'Ballast: Approve DAI')
			}

			handleTx(ballastContract.buy(exponentiate(inputVal).toString()), 'Ballast: Swap DAI to baoUSD')
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
			BigNumber.from(inputVal.toString()).gt(maxValues[swapDirection ? 'sell' : 'buy']) ||
			(swapDirection && BigNumber.from(inputVal).gt(decimate(reserves).toString())) ||
			(!swapDirection && BigNumber.from(inputVal).gt(decimate(supplyCap).toString())),
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
