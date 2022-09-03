import Config from '@/bao/lib/config'
import { approve } from '@/bao/utils'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { exponentiate } from '@/utils/numberFormat'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import React, { useMemo } from 'react'

const MigrationButton: React.FC<MigrationButtonProps> = ({ inputVal, maxValue }: MigrationButtonProps) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()

	const inputApproval = useAllowance(Config.addressMap.BAO, Config.contracts.stabilizer[Config.networkId].address)

	const handleClick = async () => {
		if (!bao) return

		const SwapperContract = bao.getContract('stabilizer')
		// BAOv1->BAOv2
		if (!inputApproval.gt(0)) {
			const tokenContract = bao.getNewContract('erc20.json', Config.addressMap.BAO)
			return handleTx(approve(tokenContract, SwapperContract, account), 'Migration: Approve BAOv1')
		}

		handleTx(SwapperContract.methods.sell(exponentiate(inputVal).toString()).send({ from: account }), 'Migration: Swap BAOv1 to BAOv2')
	}

	const buttonText = () => {
		if (!inputApproval) return <Loader />

		if (pendingTx) {
			return typeof pendingTx === 'string' ? (
				<a href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noreferrer'>
					Pending Transaction <FontAwesomeIcon icon='external-link-alt' />
				</a>
			) : (
				'Pending Transaction'
			)
		} else {
			return inputApproval.gt(0) ? 'Swap BAOv1 for BAOv2' : 'Approve BAOv1'
		}
	}

	const isDisabled = useMemo(
		() => typeof pendingTx === 'string' || pendingTx || new BigNumber(inputVal).isNaN() || new BigNumber(inputVal).gt(maxValue),
		[pendingTx, inputVal],
	)

	return (
		<Button fullWidth onClick={handleClick} disabled={isDisabled}>
			{buttonText()}
		</Button>
	)
}

type MigrationButtonProps = {
	inputVal: string
	maxValue: BigNumber
}

export default MigrationButton
