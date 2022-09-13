import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import { approve, getGaugeControllerContract, getMinterContract } from '@/bao/utils'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useGaugeInfo from '@/hooks/vebao/useGaugeInfo'
import useLockInfo from '@/hooks/vebao/useLockInfo'
import { exponentiate, getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import Image from 'next/image'
import Link from 'next/link'
import { default as React, useCallback, useMemo, useState } from 'react'

interface StakeProps {
	gauge: ActiveSupportedGauge
	max: BigNumber
	onHide: () => void
}

export const Stake: React.FC<StakeProps> = ({ gauge, max, onHide }) => {
	const bao = useBao()
	const { account } = useWeb3React()
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
				{allowance && !allowance.toNumber() ? (
					<>
						{pendingTx ? (
							<Button fullWidth disabled={true}>
								Approving {gauge.name}
							</Button>
						) : (
							<Button
								fullWidth
								onClick={async () => {
									handleTx(approve(gauge.lpContract, gauge.gaugeContract, account), `Approve ${gauge.name}`)
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
								disabled={!val || !bao || isNaN(val as any) || parseFloat(val) > max.toNumber()}
								onClick={async () => {
									const stakeTx = gauge.gaugeContract.methods.deposit(ethers.utils.parseUnits(val.toString(), 18)).send({ from: account })

									handleTx(stakeTx, `Deposit ${parseFloat(val).toFixed(4)} ${gauge.name} into gauge`, () => hideModal())
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
	const { account } = useWeb3React()
	const [val, setVal] = useState('')
	const { pendingTx, handleTx } = useTransactionHandler()

	const gaugeInfo = useGaugeInfo(gauge)

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
								!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(fullBalance) || gaugeInfo.balance.eq(new BigNumber(0))
							}
							onClick={async () => {
								const amount = val && isNaN(val as any) ? exponentiate(val, 18) : new BigNumber(0).toFixed(4)

								const unstakeTx = gauge.gaugeContract.methods.withdraw(ethers.utils.parseUnits(val, 18)).send({ from: account })

								handleTx(unstakeTx, `Withdraw ${amount} ${gauge.name} from gauge`, () => hideModal())
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
	const bao = useBao()
	const gaugeInfo = useGaugeInfo(gauge)
	const { account } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()
	const minterContract = getMinterContract(bao)

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
								{getDisplayBalance(gaugeInfo && gaugeInfo.claimableTokens)}
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
							disabled={gaugeInfo && !gaugeInfo.claimableTokens.toNumber()}
							onClick={async () => {
								const harvestTx = minterContract.methods.mint(gauge.gaugeAddress).send({ from: account })

								handleTx(harvestTx, `Harvest ${getDisplayBalance(gaugeInfo && gaugeInfo.claimableTokens)} CRV from ${gauge.name}`)
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
	const [val, setVal] = useState('')
	const { account } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()
	const gaugeControllerContract = getGaugeControllerContract(bao)
	const lockInfo = useLockInfo()

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

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
								const stakeTx = gaugeControllerContract.methods
									.vote_for_gauge_weights(gauge.gaugeAddress, parseFloat(val) * 10)
									.send({ from: account })

								handleTx(stakeTx, `${gauge.name} gauge - Voted ${parseFloat(val).toFixed(2)}% of your voting power`)
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
			{operation === 'Unstake' && <Unstake gauge={gauge} max={gaugeInfo.balance} onHide={onHide} />}
			{operation === 'Vote' && <Vote gauge={gauge} />}
			{operation === 'Rewards' && <Rewards gauge={gauge} />}
		</div>
	)
}

export default Actions
