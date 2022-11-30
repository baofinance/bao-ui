/* eslint-disable @typescript-eslint/ban-ts-comment */
import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import Button from '@/components/Button'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/markets/useApprovals'
import type { Erc20 } from '@/typechain/index'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import Link from 'next/link'
import { MarketOperations } from './Modals/Modals'

type MarketButtonProps = {
	operation: MarketOperations
	asset: ActiveSupportedMarket
	val: BigNumber
	isDisabled: boolean
	onHide: () => void
}

const MarketButton = ({ operation, asset, val, isDisabled, onHide }: MarketButtonProps) => {
	const { pendingTx, handleTx } = useTransactionHandler()
	const { approvals } = useApprovals()
	const { marketContract } = asset
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress)

	if (pendingTx) {
		return (
			<Button fullWidth disabled={true}>
				{typeof pendingTx === 'string' ? (
					<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank'>
						<a>
							Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
						</a>
					</Link>
				) : (
					'Pending Transaction'
				)}
			</Button>
		)
	} else {
		switch (operation) {
			case MarketOperations.supply:
				return approvals && (asset.underlyingAddress === 'ETH' || approvals[asset.underlyingAddress].gt(0)) ? (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={async () => {
							let mintTx
							if (asset.underlyingAddress === 'ETH') {
								// @ts-ignore
								mintTx = marketContract.mint(true, {
									value: val,
								})
								// TODO- Give the user the option in the SupplyModal to tick collateral on/off
							} else {
								// @ts-ignore
								mintTx = marketContract.mint(val, true) // TODO- Give the user the option in the SupplyModal to tick collateral on/off
							}
							handleTx(
								mintTx,
								`Markets: Supply ${getDisplayBalance(val, asset.underlyingDecimals).toString()} ${asset.underlyingSymbol}`,
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
							const tx = erc20.approve(marketContract.address, ethers.constants.MaxUint256)
							handleTx(tx, `Markets: Approve ${asset.underlyingSymbol}`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)

			case MarketOperations.withdraw:
				return (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={() => {
							handleTx(
								marketContract.redeemUnderlying(val.toString()),
								`Markets: Withdraw ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
								() => onHide(),
							)
						}}
					>
						Withdraw
					</Button>
				)

			case MarketOperations.mint:
				return (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={() => {
							handleTx(
								marketContract.borrow(val),
								`Markets: Mint ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
								() => {
									onHide()
								},
							)
						}}
					>
						Mint
					</Button>
				)

			case MarketOperations.repay:
				return approvals && (asset.underlyingAddress === 'ETH' || approvals[asset.underlyingAddress].gt(0)) ? (
					<Button
						fullWidth
						disabled={isDisabled}
						onClick={() => {
							let repayTx
							if (asset.underlyingAddress === 'ETH') {
								// @ts-ignore
								repayTx = marketContract.repayBorrow({
									value: val,
								})
							} else {
								repayTx = marketContract.repayBorrow(val)
							}
							handleTx(repayTx, `Markets: Repay ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`, () =>
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
							const tx = erc20.approve(marketContract.address, ethers.constants.MaxUint256)
							handleTx(tx, `Markets: Approve ${asset.underlyingSymbol}`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)
		}
	}
}

export default MarketButton
