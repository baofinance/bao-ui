import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Config from 'bao/lib/config'
import { approvev2 } from 'bao/utils'
import BigNumber from 'bignumber.js'
import ExternalLink from 'components/ExternalLink'
import { SpinnerLoader } from 'components/Loader'
import useAllowancev2 from 'hooks/base/useAllowancev2'
import useBao from 'hooks/base/useBao'
import useTransactionHandler from 'hooks/base/useTransactionHandler'
import React, { useMemo } from 'react'
import { useWallet } from 'use-wallet'
import { decimate, exponentiate } from 'utils/numberFormat'
import { SubmitButton } from '../../Markets/components/MarketButton'

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
		Config.addressMap.DAI,
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
			// BaoUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tokenContract = bao.getNewContract(
					'erc20.json',
					Config.addressMap.baoUSD,
				)
				return handleTx(
					approvev2(tokenContract, ballastContract, account),
					'Ballast: Approve BaoUSD',
				)
			}

			handleTx(
				ballastContract.methods
					.sell(exponentiate(inputVal).toString())
					.send({ from: account }),
				'Ballast: Swap BaoUSD to DAI',
			)
		} else {
			// DAI->baoUSD
			if (!inputAApproval.gt(0)) {
				const tokenContract = bao.getNewContract(
					'erc20.json',
					Config.addressMap.DAI,
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
				'Ballast: Swap DAI to BaoUSD',
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
				return inputBApproval.gt(0) ? 'Swap BaoUSD for DAI' : 'Approve BaoUSD'
			} else {
				return inputAApproval.gt(0) ? 'Swap DAI for BaoUSD' : 'Approve DAI'
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
