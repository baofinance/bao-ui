import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import { approve } from '@/bao/utils'
import Button from '@/components/Button'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/markets/useApprovals'
import { decimate } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Link from 'next/link'
import React from 'react'
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
	const { account } = useWeb3React()
	const { approvals } = useApprovals(pendingTx)

	const { marketContract } = asset

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
								mintTx = marketContract.mint(true, {
									value: val.toString(),
								})
							// TODO- Give the user the option in the SupplyModal to tick collateral on/off
							} else {
								mintTx = marketContract.mint(val.toString(), true) // TODO- Give the user the option in the SupplyModal to tick collateral on/off
							}
							handleTx(mintTx, `Supply ${decimate(val, asset.underlyingDecimals).toFixed(4)} ${asset.underlyingSymbol}`, () => onHide())
						}}
					>
						Supply
					</Button>
				) : (
					<Button
						fullWidth
						disabled={!approvals}
						onClick={() => {
							const { underlyingContract } = asset
							handleTx(approve(underlyingContract, marketContract), `Approve ${asset.underlyingSymbol} for Markets`)
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
								`Withdraw ${decimate(val, asset.underlyingDecimals).toFixed(4)} ${asset.underlyingSymbol}`,
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
								marketContract.borrow(val.toString()),
								`Mint ${decimate(val, asset.underlyingDecimals).toFixed(4)} ${asset.symbol}`,
								() => onHide(),
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
								repayTx = marketContract.repayBorrow({
									value: val.toString(),
								})
							} else {
								repayTx = marketContract.repayBorrow(val.toString()) 
							}
							handleTx(repayTx, `Repay ${decimate(val, asset.underlyingDecimals).toFixed(4)} ${asset.underlyingSymbol}`, () => onHide())
						}}
					>
						Repay
					</Button>
				) : (
					<Button
						fullWidth
						disabled={!approvals}
						onClick={() => {
							const { underlyingContract } = asset
							handleTx(approve(underlyingContract, marketContract), `Approve ${asset.underlyingSymbol} for Markets`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)
		}
	}
}

export default MarketButton
