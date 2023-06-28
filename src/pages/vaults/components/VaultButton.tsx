/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import { PendingTransaction } from '@/components/Loader/Loader'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/vaults/useApprovals'
import type { Erc20 } from '@/typechain/index'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'

type VaultButtonProps = {
	operation: string
	asset: ActiveSupportedVault
	val: BigNumber
	isDisabled: boolean
	onHide?: () => void
	vaultName: string
}

const VaultButton = ({ operation, asset, val, isDisabled, onHide, vaultName }: VaultButtonProps) => {
	const { pendingTx, handleTx, txHash } = useTransactionHandler()
	const { approvals } = useApprovals(vaultName)
	const { vaultContract } = asset
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress)

	if (pendingTx) {
		return (
			<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
				<Button fullWidth className='!rounded-full'>
					<PendingTransaction /> Pending Transaction
					<FontAwesomeIcon icon={faExternalLink} className='ml-2 text-baoRed' />
				</Button>
			</a>
		)
	} else {
		switch (operation) {
			case 'Supply':
				return approvals && (asset.underlyingAddress === 'ETH' || approvals[asset.underlyingAddress].gt(0)) ? (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={async () => {
							let mintTx
							if (asset.underlyingAddress === 'ETH') {
								// @ts-ignore
								mintTx = vaultContract.mint(true, {
									value: val,
								})
								// TODO- Give the user the option in the SupplyModal to tick collateral on/off
							} else {
								// @ts-ignore
								mintTx = vaultContract.mint(val, true) // TODO- Give the user the option in the SupplyModal to tick collateral on/off
							}
							handleTx(
								mintTx,
								`${vaultName} Vault: Supply ${getDisplayBalance(val, asset.underlyingDecimals).toString()} ${asset.underlyingSymbol}`,
								() => onHide(),
							)
						}}
					>
						Supply
					</Button>
				) : (
					<Button
						fullWidth
						disabled={!approvals}
						onClick={() => {
							// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
							const tx = erc20.approve(vaultContract.address, ethers.constants.MaxUint256)
							handleTx(tx, `${vaultName} Vault: Approve ${asset.underlyingSymbol}`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)

			case 'Withdraw':
				return (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={() => {
							handleTx(
								vaultContract.redeemUnderlying(val.toString()),
								`${vaultName} Vault: Withdraw ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
								() => onHide(),
							)
						}}
					>
						Withdraw
					</Button>
				)

			case 'Mint':
				return (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={() => {
							handleTx(
								vaultContract.borrow(val),
								`${vaultName} Vault: Mint ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
								() => {
									onHide()
								},
							)
						}}
					>
						Mint
					</Button>
				)

			case 'Repay':
				console.log(approvals && approvals[asset.underlyingAddress])
				return approvals && (asset.underlyingAddress === 'ETH' || approvals[asset.underlyingAddress].gt(0)) ? (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={() => {
							let repayTx
							if (asset.underlyingAddress === 'ETH') {
								// @ts-ignore
								repayTx = vaultContract.repayBorrow({
									value: val,
								})
							} else {
								repayTx = vaultContract.repayBorrow(val)
							}
							handleTx(
								repayTx,
								`${vaultName} Vault: Repay ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
								() => onHide(),
							)
						}}
					>
						Repay
					</Button>
				) : (
					<Button
						fullWidth
						disabled={!approvals}
						onClick={() => {
							// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
							const tx = erc20.approve(vaultContract.address, ethers.constants.MaxUint256)
							handleTx(tx, `${vaultName} Vault: Approve ${asset.underlyingSymbol}`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)
		}
	}
}

export default VaultButton
