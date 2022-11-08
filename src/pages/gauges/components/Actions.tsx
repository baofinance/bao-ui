//import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGaugeInfo from '@/hooks/vebao/useGaugeInfo'
import useVotingPowerAllocated from '@/hooks/vebao/useVotingPowerAllocated'
import type { Gauge, GaugeController, Minter } from '@/typechain/index'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { default as React, useCallback, useMemo, useState } from 'react'

interface StakeProps {
	gauge: ActiveSupportedGauge
	max: BigNumber
	onHide: () => void
}

export const Stake: React.FC<StakeProps> = ({ gauge, max, onHide }) => {
	const { account, library } = useWeb3React()
	const [val, setVal] = useState('')
	const { pendingTx, handleTx } = useTransactionHandler()

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

	const allowance = useAllowance(gauge.lpAddress, gauge.gaugeAddress)

	const hideModal = useCallback(() => {
		onHide()
		setVal('')
	}, [onHide])

	console.log('Allowance', allowance.toString())

	return (
		<>
			<>
				<Modal.Body className='h-[120px]'>
					<div className='flex h-full flex-col items-center justify-center'>
						<div className='flex w-full flex-row'>
							<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
								<Typography variant='sm' className='text-text-200'>
									Balance:
								</Typography>
								<Typography variant='sm'>
									{fullBalance}{' '}
									<a href={gauge.pairUrl} target='_blank' rel='noopener noreferrer' className='hover:text-text-400'>
										{gauge.name} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
									</a>
								</Typography>
							</div>
						</div>
						<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={gauge.name} />
					</div>
				</Modal.Body>
			</>
			<Modal.Actions>
				{allowance && allowance.lte(0) ? (
					<>
						{pendingTx ? (
							<Button fullWidth disabled={true}>
								Approving {gauge.name}
							</Button>
						) : (
							<Button
								fullWidth
								disabled={max.lte(0)}
								onClick={async () => {
									// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
									const tx = gauge.lpContract.approve(gauge.gaugeAddress, ethers.constants.MaxUint256)
									handleTx(tx, `${gauge.name} Gauge: Approve ${gauge.symbol}`)
								}}
							>
								Approve {gauge.name}
							</Button>
						)}
					</>
				) : (
					<>
						{pendingTx ? (
							<Button fullWidth disabled={true}>
								{typeof pendingTx === 'string' ? (
									<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
										Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
									</Link>
								) : (
									'Pending Transaction'
								)}
							</Button>
						) : (
							<Button
								fullWidth
								disabled={!val || isNaN(val as any) || parseUnits(val).gt(max)}
								onClick={async () => {
									const amount = parseUnits(val)
									const stakeTx = gauge.gaugeContract['deposit(uint256)'](amount)

									console.log('amount', amount.toString())

									handleTx(stakeTx, `${gauge.name} Gauge: Deposit ${parseFloat(val).toFixed(4)} ${gauge.name}`, () => hideModal())
								}}
							>
								Deposit {gauge.name}
							</Button>
						)}
					</>
				)}
			</Modal.Actions>
		</>
	)
}

interface UnstakeProps {
	gauge: ActiveSupportedGauge
	max: BigNumber
	onHide: () => void
}

export const Unstake: React.FC<UnstakeProps> = ({ gauge, max, onHide }) => {
	const bao = useBao()
	const [val, setVal] = useState('')
	const { pendingTx, handleTx } = useTransactionHandler()

	const gaugeInfo = useGaugeInfo(gauge)

	const gaugeContract = useContract<Gauge>('Gauge', gauge.gaugeAddress)

	const fullBalance = useMemo(() => {
		return getFullDisplayBalance(max)
	}, [max])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const handleSelectMax = useCallback(() => {
		setVal(fullBalance)
	}, [fullBalance, setVal])

	const hideModal = useCallback(() => {
		onHide()
		setVal('')
	}, [onHide])

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
							<Typography variant='sm' className='text-text-200'>
								Balance:
							</Typography>
							<Typography variant='sm'>
								{getDisplayBalance(fullBalance, 0)}{' '}
								<Link href={gauge.pairUrl} target='_blank' rel='noopener noreferrer' className='hover:text-text-400'>
									<a>
										{gauge.name} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
									</a>
								</Link>
							</Typography>
						</div>
					</div>
					<Input onSelectMax={handleSelectMax} onChange={handleChange} value={val} max={fullBalance} symbol={gauge.name} />
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					{pendingTx ? (
						<Button disabled={true}>
							{typeof pendingTx === 'string' ? (
								<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
									<a>
										Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
									</a>
								</Link>
							) : (
								'Pending Transaction'
							)}
						</Button>
					) : (
						<Button
							disabled={
								!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(fullBalance) || gaugeInfo.balance.eq(BigNumber.from(0))
							}
							onClick={async () => {
								const amount = parseUnits(val, 18)
								const unstakeTx = gaugeContract['withdraw(uint256)'](amount)
								handleTx(unstakeTx, `${gauge.name} Gauge: Withdraw ${amount} ${gauge.name}`, () => hideModal())
							}}
						>
							Withdraw {gauge.name}
						</Button>
					)}
				</>
			</Modal.Actions>
		</>
	)
}

interface RewardsProps {
	gauge: ActiveSupportedGauge
}

export const Rewards: React.FC<RewardsProps> = ({ gauge }) => {
	const gaugeInfo = useGaugeInfo(gauge)
	const { pendingTx, handleTx } = useTransactionHandler()
	const minterContract = useContract<Minter>('Minter')

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex items-center justify-center'>
						<div className='flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border-0 bg-primary-300'>
							<Image src='/images/tokens/BAO.png' alt='ETH' width={32} height={32} className='m-auto' />
						</div>
						<div className='ml-2'>
							<Typography variant='xl' className='font-medium'>
								{gaugeInfo && getDisplayBalance(gaugeInfo.claimableTokens)}
							</Typography>
						</div>
					</div>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					{pendingTx ? (
						<Button fullWidth disabled={true}>
							{typeof pendingTx === 'string' ? (
								<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
									<a>
										Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
									</a>
								</Link>
							) : (
								'Pending Transaction'
							)}
						</Button>
					) : (
						<Button
							fullWidth
							disabled={gaugeInfo && gaugeInfo.claimableTokens.lte(0)}
							onClick={async () => {
								const harvestTx = minterContract.mint(gauge.gaugeAddress)
								handleTx(harvestTx, `${gauge.name} Gauge: Harvest ${getDisplayBalance(gaugeInfo && gaugeInfo.claimableTokens)} CRV`)
							}}
						>
							Harvest BAO
						</Button>
					)}
				</>
			</Modal.Actions>
		</>
	)
}

interface VoteProps {
	gauge: ActiveSupportedGauge
}

export const Vote: React.FC<VoteProps> = ({ gauge }) => {
	const bao = useBao()
	const { library } = useWeb3React()
	const [val, setVal] = useState('')
	const { pendingTx, handleTx } = useTransactionHandler()
	const gaugeControllerContract = useContract<GaugeController>('GaugeController')
	//const lockInfo = useLockInfo()
	const votingPowerAllocated = useVotingPowerAllocated()

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	console.log('Voting Power Allocated', votingPowerAllocated.toString())
	console.log(val)

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='my-4 flex h-12 flex-row'>
					<Typography>
						Vote{' '}
						<input
							type='number'
							value={val}
							onChange={handleChange}
							className='relative h-8 w-10 min-w-0 appearance-none
				rounded border-solid border-inherit bg-primary-400 pl-2 pr-2 text-end 
				align-middle outline-none outline outline-2 outline-offset-2 transition-all
				 duration-200 disabled:text-text-200 md:text-sm'
						/>
						% (of your voting power)
					</Typography>
				</div>
				<div>
					<Typography>Current Voting Power Allocated</Typography>
					<Typography className='text-text-200'>
						{votingPowerAllocated.gt(0) ? BigNumber.from(10000).div(votingPowerAllocated).toNumber() : '0'}%
					</Typography>
				</div>
			</Modal.Body>
			<Modal.Actions>
				<>
					{pendingTx ? (
						<Button fullWidth disabled={true}>
							{typeof pendingTx === 'string' ? (
								<Link href={`${Config.defaultRpc.blockExplorerUrls}/tx/${pendingTx}`} target='_blank' rel='noopener noreferrer'>
									Pending Transaction <FontAwesomeIcon icon={faExternalLinkAlt} />
								</Link>
							) : (
								'Pending Transaction'
							)}
						</Button>
					) : (
						<Button
							fullWidth
							disabled={!val || !bao || isNaN(val as any)}
							onClick={async () => {
								const voteTx = gaugeControllerContract.vote_for_gauge_weights(gauge.gaugeAddress, BigNumber.from(val).mul(100))
								handleTx(voteTx, `${gauge.name} Gauge: Voted ${parseFloat(val).toFixed(2)}% of your veBAO`)
							}}
						>
							Vote for {gauge.name}
						</Button>
					)}
				</>
			</Modal.Actions>
		</>
	)
}

interface ActionProps {
	onHide: () => void
	gauge: ActiveSupportedGauge
	operation: string
}

const Actions: React.FC<ActionProps> = ({ gauge, onHide, operation }) => {
	const gaugeInfo = useGaugeInfo(gauge)
	const tokenBalance = useTokenBalance(gauge.lpAddress)

	return (
		<div>
			{operation === 'Stake' && <Stake gauge={gauge} max={tokenBalance} onHide={onHide} />}
			{operation === 'Unstake' && <Unstake gauge={gauge} max={gaugeInfo && gaugeInfo.balance} onHide={onHide} />}
			{operation === 'Vote' && <Vote gauge={gauge} />}
			{operation === 'Rewards' && <Rewards gauge={gauge} />}
		</div>
	)
}

export default Actions
