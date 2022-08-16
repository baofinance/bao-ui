import Config from '@/bao/lib/config'
import { approvev2 } from '@/bao/utils'
import { SpinnerLoader } from '@/components/Loader'
import useAllowancev2 from '@/hooks/base/useAllowancev2'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { decimate, exponentiate } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'

const BallastButton: React.FC<BallastButtonProps> = ({ swapDirection, inputVal, maxValues, supplyCap, reserves }: BallastButtonProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()

	const inputAApproval = useAllowancev2(Config.addressMap.DAI, Config.contracts.stabilizer[Config.networkId].address)
	const inputBApproval = useAllowancev2(Config.addressMap.baoUSD, Config.contracts.stabilizer[Config.networkId].address)

	const handleClick = async () => {
		if (!bao) return

		const ballastContract = bao.getContract('stabilizer')
		if (swapDirection) {
			// BaoUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tokenContract = bao.getNewContract('erc20.json', Config.addressMap.baoUSD)
				return handleTx(approvev2(tokenContract, ballastContract, account), 'Ballast: Approve BaoUSD')
			}

			handleTx(ballastContract.methods.sell(exponentiate(inputVal).toString()).send({ from: account }), 'Ballast: Swap BaoUSD to DAI')
		} else {
			// DAI->baoUSD
			if (!inputAApproval.gt(0)) {
				const tokenContract = bao.getNewContract('erc20.json', Config.addressMap.DAI)
				return handleTx(approvev2(tokenContract, ballastContract, account), 'Ballast: Approve DAI')
			}

			handleTx(ballastContract.methods.buy(exponentiate(inputVal).toString()).send({ from: account }), 'Ballast: Swap DAI to BaoUSD')
		}
	}

	const buttonText = () => {
		if (!(inputAApproval && inputBApproval)) return <SpinnerLoader />

		if (pendingTx) {
			return typeof pendingTx === 'string' ? (
				<a href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noreferrer'>
					Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
				</a>
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
		<button
			className={`border-1 relative inline-flex h-12 w-full min-w-[2.5rem] select-none appearance-none items-center justify-center whitespace-nowrap rounded-lg border-solid border-primary-300 bg-background-200 pr-4 pl-4 align-middle text-default font-strong leading-5 text-text-100 outline-none outline-offset-2 transition-all ${(props: {
				disabled: any
			}) =>
				props.disabled
					? 'opacity-50'
					: 'opacity-100'} duartion-200 mb-2 overflow-hidden hover:cursor-pointer hover:bg-primary-300 hover:text-text-100 focus:outline-none !hover:cursor-${(props: {
				disabled: any
			}) => (props.disabled ? 'not-allowed' : 'pointer')}`}
			onClick={handleClick}
			disabled={isDisabled}
		>
			{buttonText()}
		</button>
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
