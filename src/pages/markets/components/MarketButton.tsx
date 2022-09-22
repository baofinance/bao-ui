import Config from '@/bao/lib/config'
import { ActiveSupportedMarket } from '@/bao/lib/types'
import Button from '@/components/Button'
import useBao from '@/hooks/base/useBao'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/markets/useApprovals'
import { decimate } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
//import { useWeb3React } from '@web3-react/core'
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
	const bao = useBao()
	const { library } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()
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
							handleTx(mintTx, `Supply ${decimate(val, asset.underlyingDecimals).toString()} ${asset.underlyingSymbol}`, () => onHide())
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
							const tx = underlyingContract.approve(
								marketContract,
								ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
								library.getSigner(),
							)
							handleTx(tx, `Approve ${asset.underlyingSymbol} for Markets`)
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
								`Withdraw ${decimate(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
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
								`Mint ${decimate(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`,
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
								repayTx = marketContract.repayBorrow({
									value: val.toString(),
								})
							} else {
								repayTx = marketContract.repayBorrow(val.toString())
							}
							handleTx(repayTx, `Repay ${decimate(val, asset.underlyingDecimals)} ${asset.underlyingSymbol}`, () => onHide())
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
							const tx = underlyingContract.approve(
								marketContract,
								ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
								library.getSigner(),
							)
							handleTx(tx, `Approve ${asset.underlyingSymbol} for Markets`)
						}}
					>
						Approve {asset.underlyingSymbol}
					</Button>
				)
		}
	}
}

export default MarketButton
