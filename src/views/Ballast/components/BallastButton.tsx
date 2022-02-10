import React, { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import Config from '../../../bao/lib/config'
import useTransactionHandler from '../../../hooks/base/useTransactionHandler'
import useAllowancev2 from '../../../hooks/base/useAllowancev2'
import useBao from '../../../hooks/base/useBao'
import { useWallet } from 'use-wallet'
import { decimate, exponentiate } from '../../../utils/numberFormat'
import { approvev2 } from '../../../bao/utils'
import { SpinnerLoader } from '../../../components/Loader'
import { SubmitButton } from '../../Markets/components/MarketButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ExternalLink from '../../../components/ExternalLink'

const BallastButton: React.FC<BallastButtonProps> = ({
	swapDirection,
	inputVal,
	maxValues,
	supplyCap,
	reserves,
}: BallastButtonProps) => {
	const bao = useBao()
	const { account } = useWallet()
	const { pendingTx, handleTx } = useTransactionHandler()

	const inputAApproval = useAllowancev2(
		'0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108', // TestDAI
		Config.contracts.stabilizer[Config.networkId].address,
		[pendingTx],
	)
	const inputBApproval = useAllowancev2(
		Config.addressMap.baoUSD,
		Config.contracts.stabilizer[Config.networkId].address,
		[pendingTx],
	)

	const handleClick = async () => {
		if (!bao) return

		const ballastContract = bao.getContract('stabilizer')
		if (swapDirection) {
			// bUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tokenContract = bao.getNewContract(
					'erc20.json',
					Config.addressMap.baoUSD,
				)
				return handleTx(
					approvev2(tokenContract, ballastContract, account),
					'Ballast: Approve baoUSD',
				)
			}

			handleTx(
				ballastContract.methods
					.sell(exponentiate(inputVal).toString())
					.send({ from: account }),
				'Ballast: Swap baoUSD to DAI',
			)
		} else {
			// DAI->bUSD
			if (!inputAApproval.gt(0)) {
				const tokenContract = bao.getNewContract(
					'erc20.json',
					'0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108', // TestDAI
				)
				return handleTx(
					approvev2(tokenContract, ballastContract, account),
					'Ballast: Approve DAI',
				)
			}

			handleTx(
				ballastContract.methods
					.buy(exponentiate(inputVal).toString())
					.send({ from: account }),
				'Ballast: Swap DAI to baoUSD',
			)
		}
	}

	const buttonText = () => {
		if (!(inputAApproval && inputBApproval)) return <SpinnerLoader />

		if (pendingTx) {
			return typeof pendingTx === 'string' ? (
				<ExternalLink
					href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`}
					target="_blank"
				>
					Pending Transaction <FontAwesomeIcon icon="external-link-alt" />
				</ExternalLink>
			) : (
				'Pending Transaction'
			)
		} else {
			if (swapDirection) {
				return inputBApproval.gt(0) ? 'Swap baoUSD for DAI' : 'Approve baoUSD'
			} else {
				return inputAApproval.gt(0) ? 'Swap DAI for bUSD' : 'Approve DAI'
			}
		}
	}

	const isDisabled = useMemo(
		() =>
			typeof pendingTx === 'string' ||
			pendingTx ||
			new BigNumber(inputVal).isNaN() ||
			new BigNumber(inputVal).gt(maxValues[swapDirection ? 'sell' : 'buy']) ||
			(swapDirection && new BigNumber(inputVal).gt(decimate(reserves))) ||
			(!swapDirection && new BigNumber(inputVal).gt(decimate(supplyCap))),
		[pendingTx, inputVal, swapDirection, reserves, supplyCap],
	)

	return (
		<SubmitButton onClick={handleClick} disabled={isDisabled}>
			{buttonText()}
		</SubmitButton>
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
