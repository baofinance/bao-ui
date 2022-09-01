import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
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
	const { account } = useWeb3React()
	const { handleTx } = useTransactionHandler()

	const inputAApproval = useAllowance(Config.addressMap.DAI, Config.contracts.stabilizer[Config.networkId].address)
	const inputBApproval = useAllowance(Config.addressMap.baoUSD, Config.contracts.stabilizer[Config.networkId].address)

	const handleClick = async () => {
		if (!bao) return

		const ballastContract = bao.getContract('stabilizer')
		if (swapDirection) {
			// baoUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tokenContract = bao.getNewContract('erc20.json', Config.addressMap.baoUSD)
				return handleTx(approve(tokenContract, ballastContract, account), 'Ballast: Approve baoUSD')
			}

			handleTx(ballastContract.methods.sell(exponentiate(inputVal).toString()).send({ from: account }), 'Ballast: Swap baoUSD to DAI')
		} else {
			// DAI->baoUSD
			if (!inputAApproval.gt(0)) {
				const tokenContract = bao.getNewContract('erc20.json', Config.addressMap.DAI)
				return handleTx(approve(tokenContract, ballastContract, account), 'Ballast: Approve DAI')
			}

			handleTx(ballastContract.methods.buy(exponentiate(inputVal).toString()).send({ from: account }), 'Ballast: Swap DAI to baoUSD')
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
			new BigNumber(inputVal).isNaN() ||
			new BigNumber(inputVal).gt(maxValues[swapDirection ? 'sell' : 'buy']) ||
			(swapDirection && new BigNumber(inputVal).gt(decimate(reserves))) ||
			(!swapDirection && new BigNumber(inputVal).gt(decimate(supplyCap))),
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
