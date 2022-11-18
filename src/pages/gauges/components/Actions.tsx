//import { useWeb3React } from '@web3-react/core'
import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useContract from '@/hooks/base/useContract'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGaugeInfo from '@/hooks/vebao/useGaugeInfo'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import useUserSlopes from '@/hooks/vebao/useUserSlopes'
import useVotingPowerAllocated from '@/hooks/vebao/useVotingPowerAllocated'
import type { Gauge, GaugeController, Minter } from '@/typechain/index'
import { getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { default as React, useCallback, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'

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

									handleTx(stakeTx, `${gauge.name} Gauge: Deposit ${formatUnits(amount)} ${gauge.name}`, () => hideModal())
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
								handleTx(unstakeTx, `${gauge.name} Gauge: Withdraw ${formatUnits(amount)} ${gauge.name}`, () => hideModal())
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
							onClick={async () => {
								const harvestTx = minterContract.mint(gauge.gaugeAddress)
								handleTx(harvestTx, `${gauge.name} Gauge: Harvest ${getDisplayBalance(gaugeInfo && gaugeInfo.claimableTokens)} BAO`)
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
	const { pendingTx, handleTx } = useTransactionHandler()
	const gaugeControllerContract = useContract<GaugeController>('GaugeController')
	const lockInfo = useLockInfo()
	const votingPowerAllocated = useVotingPowerAllocated()
	const userSlopes = useUserSlopes(gauge)
	const [val, setVal] = useState(userSlopes ? userSlopes.power.div(100).toString() : 0)

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	console.log(
		'Power Remaining',
		BigNumber.from(100)
			.sub(votingPowerAllocated.div(BigNumber.from(100)))
			.toString(),
	)

	return (
		<>
			<Modal.Body>
				<StatBlock
					label='veBAO Stats'
					stats={[
						{
							label: 'Total Voting Power',
							value: `${lockInfo ? getDisplayBalance(lockInfo.balance, 18, 2) : BigNumber.from(0)}`,
						},
						{
							label: 'Total Allocated',
							value: `${votingPowerAllocated ? votingPowerAllocated.div(BigNumber.from(100)) : BigNumber.from(0)}%`,
						},
						{
							label: `Allocated to ${gauge.name}`,
							value: `${userSlopes ? userSlopes.power.div(100) : BigNumber.from(0)}%`,
						},
					]}
				/>
				<div className='mt-4'>
					<div className='text-center'>
						<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-3 font-bold text-text-100'>
							Vote
						</Typography>
					</div>
					<div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary-100'>
						<input
							type='range'
							id='points'
							defaultValue={userSlopes ? userSlopes.power.div(100).toString() : val}
							min={userSlopes ? userSlopes.power.div(100).toString() : 0}
							max={
								votingPowerAllocated.sub(BigNumber.from(100)).eq(0)
									? 0
									: userSlopes &&
									  lockInfo &&
									  BigNumber.from(100)
											.sub(votingPowerAllocated.div(BigNumber.from(100)))
											.add(userSlopes.power.div(100))
											.toString()
							}
							disabled={votingPowerAllocated.sub(BigNumber.from(100)).eq(0)}
							value={val}
							className='form-range border-r-1 h-6 w-full appearance-none rounded-md rounded-r-none border-background-100 bg-primary-300 p-2 focus:shadow-none focus:outline-none focus:ring-0'
							onChange={handleChange}
							onInput={handleChange}
						/>
						<input
							type='number'
							id='points'
							onChange={handleChange}
							placeholder={val.toString()}
							value={val}
							min={userSlopes ? userSlopes.power.div(100).toString() : 0}
							max={
								votingPowerAllocated.sub(BigNumber.from(100)).eq(0)
									? 0
									: userSlopes &&
									  lockInfo &&
									  BigNumber.from(100)
											.sub(votingPowerAllocated.div(BigNumber.from(100)))
											.add(userSlopes.power.div(100))
											.toString()
							}
							className='relative -mr-1 h-6 w-10 min-w-0
				appearance-none rounded border-solid border-inherit border-primary-500 bg-primary-100 pl-2 text-end 
				align-middle outline-none outline outline-2 outline-offset-2 transition-all
				 duration-200 disabled:text-text-200 md:text-sm'
						/>
						<Typography variant='sm' className='m-0 mr-2 rounded border-solid border-inherit border-primary-500 bg-primary-100 p-0'>
							%
						</Typography>
					</div>
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
								handleTx(voteTx, `${gauge.name} Gauge: Voted ${parseFloat(BigNumber.from(val).toString()).toFixed(2)}% of your veBAO`)
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
	const tokenBalance = useTokenBalance(gauge?.lpAddress)

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
