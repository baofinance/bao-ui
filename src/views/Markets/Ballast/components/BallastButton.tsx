import React, { useState } from 'react'
import Config from '../../../../bao/lib/config'
import { SubmitButton } from '../../components/MarketButton'
import useAllowancev2 from '../../../../hooks/useAllowancev2'
import useBao from '../../../../hooks/useBao'
import useTransactionProvider from '../../../../hooks/useTransactionProvider'
import { exponentiate } from '../../../../utils/numberFormat'
import { useWallet } from 'use-wallet'
import { TransactionReceipt } from 'web3-core'
import { SpinnerLoader } from '../../../../components/Loader'
import { approvev2 } from '../../../../bao/utils'

const BallastButton: React.FC<BallastButtonProps> = ({
	swapDirection,
	inputVal,
}: BallastButtonProps) => {
	const [pendingTx, setPendingTx] = useState(false)
	const bao = useBao()
	const { account } = useWallet()
	const { onAddTransaction, onTxReceipt } = useTransactionProvider()

	const inputAApproval = useAllowancev2(
		'0xDc3c1D7741E454DEC2d2e6CFFe29605E4b7e01e3', // TestDAI
		Config.contracts.stabilizer[Config.networkId].address,
		pendingTx,
	)
	const inputBApproval = useAllowancev2(
		Config.addressMap.bUSD,
		Config.contracts.stabilizer[Config.networkId].address,
		pendingTx,
	)

	const handleClick = async () => {
		if (!bao) return

		const ballastContract = bao.getContract('stabilizer')
		if (swapDirection) {
			// bUSD->DAI
			if (!inputBApproval.gt(0)) {
				const tokenContract = bao.getNewContract(
					'erc20.json',
					Config.addressMap.bUSD,
				)
				return handleTx(
					approvev2(tokenContract, ballastContract, account),
					'Ballast: Approve bUSD',
				)
			}

			handleTx(
				ballastContract.methods
					.sell(exponentiate(inputVal).toString())
					.send({ from: account }),
				'Ballast: Swap bUSD to DAI',
			)
		} else {
			// DAI->bUSD
			if (!inputAApproval.gt(0)) {
				const tokenContract = bao.getNewContract(
					'erc20.json',
					'0xDc3c1D7741E454DEC2d2e6CFFe29605E4b7e01e3', // TestDAI
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
				'Ballast: Swap DAI to bUSD',
			)
		}
	}

	const buttonText = () => {
		if (!(inputAApproval && inputBApproval)) return <SpinnerLoader />

		if (pendingTx) {
			return 'Pending Transaction'
		} else {
			if (swapDirection) {
				return inputBApproval.gt(0) ? 'Sell bUSD for DAI' : 'Approve bUSD'
			} else {
				return inputAApproval.gt(0) ? 'Buy bUSD with DAI' : 'Approve DAI'
			}
		}
	}

	const handleTx = (tx: any, description: string) => {
		setPendingTx(true)
		tx.on('transactionHash', (txHash: string) => {
			onAddTransaction({
				hash: txHash,
				description,
			})
		})
			.on('receipt', (receipt: TransactionReceipt) => {
				onTxReceipt(receipt)
				setPendingTx(false)
			})
			.on('error', () => setPendingTx(false))
	}

	return (
		<SubmitButton onClick={handleClick} disabled={pendingTx}>
			{buttonText()}
		</SubmitButton>
	)
}

type BallastButtonProps = {
	swapDirection: boolean
	inputVal: string
}

export default BallastButton
