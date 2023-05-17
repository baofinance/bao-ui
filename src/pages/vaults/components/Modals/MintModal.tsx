/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActiveSupportedVault } from '@/bao/lib/types'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/vaults/useApprovals'
import { Erc20 } from '@/typechain/Erc20'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber, ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import { useCallback } from 'react'
import { MoonLoader } from 'react-spinners'

export type MintModalProps = {
	asset: ActiveSupportedVault
	val: BigNumber
	show: boolean
	onHide: () => void
	vaultName: string
}

const MintModal = ({ asset, show, onHide, vaultName, val }: MintModalProps) => {
	const { pendingTx, txSuccess, handleTx } = useTransactionHandler()
	const { approvals } = useApprovals(vaultName)
	const { vaultContract } = asset
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress)
	const usdValue = val.mul(asset.price)

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header onClose={hideModal}>
				<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
					<Typography variant='xl' className='mr-1 inline-block'>
						Confirm Deposit
					</Typography>
				</div>
			</Modal.Header>
			<Modal.Body>
				<Typography variant='lg' className='p-6 text-center font-bakbak'>
					<Image src={`/images/tokens/${asset.icon}`} width={32} height={32} alt={asset.underlyingSymbol} className='inline p-1' />
					{getDisplayBalance(val, asset.underlyingDecimals).toString()} {asset.underlyingSymbol}{' '}
					<Badge>${getDisplayBalance(decimate(usdValue))}</Badge>
				</Typography>
			</Modal.Body>
			<Modal.Actions>
				{!pendingTx ? (
					<Button
						fullWidth
						className='!rounded-full'
						disabled={!val}
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
						Confirm
					</Button>
				) : (
					<Button fullWidth className='!rounded-full'>
						<MoonLoader size={16} speedMultiplier={0.8} color='#e21a53' className='mr-2 mt-1 align-middle' />
						Pending Transaction
					</Button>
				)}
			</Modal.Actions>
		</Modal>
	)
}

export default MintModal
