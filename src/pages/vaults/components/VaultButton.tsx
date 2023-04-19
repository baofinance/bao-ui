/* eslint-disable @typescript-eslint/ban-ts-comment */
import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/vaults/useApprovals'
import type { Erc20 } from '@/typechain/index'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import Link from 'next/link'

type VaultButtonProps = {
	operation: string
	asset: ActiveSupportedVault
	val: BigNumber
	isDisabled: boolean
	onHide?: () => void
	vaultName: string
}

const VaultButton = ({ operation, asset, val, isDisabled, onHide, vaultName }: VaultButtonProps) => {
	const { pendingTx, handleTx } = useTransactionHandler()
	const { approvals } = useApprovals(vaultName)
	const { vaultContract } = asset
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress)

	if (pendingTx) {
		return (
			<Button fullWidth disabled={true} className='!rounded-full'>
				{typeof pendingTx === 'string' ? (
					<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank'>
						<a>
							Pending <FontAwesomeIcon icon={faExternalLinkAlt} />
						</a>
					</Link>
				) : (
					'Pending Transaction'
				)}
			</Button>
		)
	} else {
		switch (operation) {
			case 'Supply':
				return approvals && (asset.underlyingAddress === 'ETH' || approvals[asset.underlyingAddress].gt(0)) ? (
					<Button
						fullWidth
						className='!rounded-full'
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
								`Vaults: Supply ${getDisplayBalance(val, asset.underlyingDecimals).toString()} ${asset.underlyingSymbol}`,
								() => onHide(),
							)
						}}
					>
						Supply
					</Button>
				) : (
					<Button
						fullWidth
						className='!rounded-full'
						disabled={!approvals}
						onClick={() => {
							// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
							const tx = erc20.approve(vaultContract.address, ethers.constants.MaxUint256)
							handleTx(tx, `Vaults: Approve ${asset.underlyingSymbol}`)
						}}
					>
						Approve
					</Button>
				)

			case 'Withdraw':
				return (
					<Button
						fullWidth
						className='!rounded-full'
						disabled={isDisabled}
						onClick={() => {
							handleTx(
								vaultContract.redeemUnderlying(val.toString()),
								`Vaults: Withdraw ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
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
						className='!rounded-full'
						disabled={isDisabled}
						onClick={() => {
							handleTx(
								vaultContract.borrow(val),
								`Vaults: Mint ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
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
							handleTx(repayTx, `Vaults: Repay ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`, () =>
								onHide(),
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
							handleTx(tx, `Vaults: Approve ${asset.underlyingSymbol}`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)
		}
	}
}

export default VaultButton
