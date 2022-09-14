import Config from '@/bao/lib/config'
import { approve, getMasterChefContract } from '@/bao/utils'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Loader from '@/components/Loader'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import { PoolType } from '@/contexts/Farms/types'
import useAllowance from '@/hooks/base/useAllowance'
import useBao from '@/hooks/base/useBao'
import useBlockDiff from '@/hooks/base/useBlockDiff'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useEarnings from '@/hooks/farms/useEarnings'
import useFees from '@/hooks/farms/useFees'
import useStakedBalance from '@/hooks/farms/useStakedBalance'
import { useUserFarmInfo } from '@/hooks/farms/useUserFarmInfo'
import { getContract } from '@/utils/erc20'
import { exponentiate, getDisplayBalance, getFullDisplayBalance } from '@/utils/numberFormat'
import { faExternalLinkAlt, faLongArrowAltRight, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import Image from 'next/image'
import Link from 'next/link'
import { default as React, useCallback, useMemo, useState } from 'react'
import { Contract } from 'web3-eth-contract'
import { FarmWithStakedValue } from './FarmList'
import { FeeModal } from './Modals'

interface StakeProps {
	lpContract: Contract
	lpTokenAddress: string
	pid: number
	max: BigNumber
	tokenName?: string
	poolType: PoolType
	ref?: string
	pairUrl: string
	onHide: () => void
}

export const Stake: React.FC<StakeProps> = ({ lpContract, lpTokenAddress, pid, poolType, max, tokenName = '', pairUrl = '', onHide }) => {
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

	const handleSelectHalf = useCallback(() => {
		setVal(
			max
				.div(10 ** 18)
				.div(2)
				.toString(),
		)
	}, [max])

	const allowance = useAllowance(lpTokenAddress, account)

	const masterChefContract = getMasterChefContract(bao)

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
							<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
								<FontAwesomeIcon icon={faLongArrowAltRight} />
								<Typography variant='sm' className='text-text-200'>
									Fee:
								</Typography>
								<Typography variant='sm'>0.75%</Typography>
							</div>
							<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
								<Typography variant='sm' className='text-text-200'>
									Balance:
								</Typography>
								<Typography variant='sm'>
									{fullBalance}{' '}
									<a href={pairUrl} target='_blank' rel='noopener noreferrer' className='hover:text-text-400'>
										{tokenName} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
									</a>
								</Typography>
							</div>
						</div>
						<Input
							onSelectMax={handleSelectMax}
							onSelectHalf={handleSelectHalf}
							onChange={handleChange}
							value={val}
							max={fullBalance}
							symbol={tokenName}
						/>
					</div>
				</Modal.Body>
			</>
			<Modal.Actions>
				{allowance && !allowance.toNumber() ? (
					<>
						{pendingTx ? (
							<Button fullWidth disabled={true}>
								Approving {tokenName}
							</Button>
						) : (
							<Button
								fullWidth
								onClick={async () => {
									const tx = bao
										.getNewContract('erc20.json', lpTokenAddress)
										.methods.approve(
											masterChefContract.options.address,
											ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
										)
										.send({ from: account })

									handleTx(tx, `Approve CRV`)
								}}
							>
								Approve {tokenName}
							</Button>
						)}
					</>
				) : (
					<>
						{poolType !== PoolType.ARCHIVED ? (
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
											const stakeTx = masterChefContract.methods
												.deposit(pid, ethers.utils.parseUnits(val.toString(), 18))
												.send({ from: account })

											handleTx(stakeTx, `Deposit ${parseFloat(val).toFixed(4)} ${tokenName}`, () => hideModal())
										}}
									>
										Deposit {tokenName}
									</Button>
								)}
							</>
						) : (
							<Button
								fullWidth
								disabled={true}
								onClick={async () => {
									const stakeTx = masterChefContract.methods
										.deposit(pid, ethers.utils.parseUnits(val.toString(), 18))
										.send({ from: account })
									handleTx(stakeTx, `Deposit ${parseFloat(val).toFixed(4)} ${tokenName}`, () => hideModal())
								}}
							>
								Pool Archived
							</Button>
						)}
					</>
				)}
			</Modal.Actions>
		</>
	)
}

interface UnstakeProps {
	farm: FarmWithStakedValue
	max: BigNumber
	tokenName?: string
	pid: number
	ref?: string
	pairUrl: string
	lpTokenAddress: string
	onHide: () => void
}

export const Unstake: React.FC<UnstakeProps> = ({ max, tokenName = '', pid, pairUrl = '', onHide }) => {
	const bao = useBao()
	const { account } = useWeb3React()
	const [val, setVal] = useState('')
	const { pendingTx, handleTx } = useTransactionHandler()

	const stakedBalance = useStakedBalance(pid)

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

	const handleSelectHalf = useCallback(() => {
		setVal(
			max
				.div(10 ** 18)
				.div(2)
				.toString(),
		)
	}, [max])

	const userInfo = useUserFarmInfo(pid)
	const blockDiff = useBlockDiff(userInfo)
	const fees = useFees(blockDiff)

	const masterChefContract = getMasterChefContract(bao)

	const [showFeeModal, setShowFeeModal] = useState(false)

	const hideModal = useCallback(() => {
		onHide()
		setVal('')
	}, [onHide])

	return (
		<>
			<Modal.Body className='h-[120px]'>
				<div className='flex h-full flex-col items-center justify-center'>
					<div className='flex w-full flex-row'>
						<div className='float-left mb-1 flex w-full items-center justify-start gap-1'>
							<FontAwesomeIcon icon={faLongArrowAltRight} />
							<Typography variant='sm' className='text-text-200'>
								Fee:{' '}
							</Typography>
							<Typography variant='sm'>
								{' '}
								{fees ? `${(fees * 100).toFixed(2)}%` : <Loader />}{' '}
								<FontAwesomeIcon
									icon={faQuestionCircle}
									onClick={() => setShowFeeModal(true)}
									className='text-text-200 hover:cursor-pointer hover:text-text-400 hover:duration-200'
								/>
							</Typography>
						</div>
						<div className='float-right mb-1 flex w-full items-center justify-end gap-1'>
							<Typography variant='sm' className='text-text-200'>
								Balance:
							</Typography>
							<Typography variant='sm'>
								{getDisplayBalance(fullBalance, 0)}{' '}
								<Link href={pairUrl} target='_blank' rel='noopener noreferrer' className='hover:text-text-400'>
									<a>
										{tokenName} <FontAwesomeIcon icon={faExternalLinkAlt} className='h-3 w-3' />
									</a>
								</Link>
							</Typography>
						</div>
					</div>
					<Input
						onSelectMax={handleSelectMax}
						onSelectHalf={handleSelectHalf}
						onChange={handleChange}
						value={val}
						max={fullBalance}
						symbol={tokenName}
					/>
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
								!val || !bao || isNaN(val as any) || parseFloat(val) > parseFloat(fullBalance) || stakedBalance.eq(new BigNumber(0))
							}
							onClick={async () => {
								const amount = val && isNaN(val as any) ? exponentiate(val, 18) : new BigNumber(0).toFixed(4)

								const unstakeTx = masterChefContract.methods.withdraw(pid, ethers.utils.parseUnits(val, 18)).send({ from: account })

								handleTx(unstakeTx, `Withdraw ${amount} ${tokenName}`, () => hideModal())
							}}
						>
							Withdraw {tokenName}
						</Button>
					)}
				</>
			</Modal.Actions>
			<FeeModal pid={pid} show={showFeeModal} onHide={() => setShowFeeModal(false)} />
		</>
	)
}

interface RewardsProps {
	pid: number
}

export const Rewards: React.FC<RewardsProps> = ({ pid }) => {
	const bao = useBao()
	const earnings = useEarnings(pid)
	const { account } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()
	const masterChefContract = getMasterChefContract(bao)

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
								{getDisplayBalance(earnings)}
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
							disabled={!earnings.toNumber()}
							onClick={async () => {
								const harvestTx = masterChefContract.methods.claimReward(pid).send({ from: account })

								handleTx(harvestTx, `Harvest ${getDisplayBalance(earnings)} BAO`)
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

interface ActionProps {
	lpContract: Contract
	lpTokenAddress: string
	pid: number
	max: BigNumber
	tokenName?: string
	poolType: PoolType
	ref?: string
	pairUrl: string
	onHide: () => void
	farm: FarmWithStakedValue
	operation: string
}

const Actions: React.FC<ActionProps> = ({ farm, onHide, operation }) => {
	const { pid } = farm
	const bao = useBao()

	const lpTokenAddress = farm.lpTokenAddress

	const lpContract = useMemo(() => {
		return getContract(bao, lpTokenAddress)
	}, [bao, lpTokenAddress])

	const tokenBalance = useTokenBalance(lpContract.options.address)
	const stakedBalance = useStakedBalance(pid)

	return (
		<div>
			{operation === 'Stake' && (
				<Stake
					lpContract={lpContract}
					lpTokenAddress={lpTokenAddress}
					pid={farm.pid}
					tokenName={farm.lpToken.toUpperCase()}
					poolType={farm.poolType}
					max={tokenBalance}
					pairUrl={farm.pairUrl}
					onHide={onHide}
				/>
			)}
			{operation === 'Unstake' && (
				<Unstake
					farm={farm}
					pid={farm.pid}
					tokenName={farm.lpToken.toUpperCase()}
					max={stakedBalance}
					pairUrl={farm.pairUrl}
					lpTokenAddress={farm.lpTokenAddress}
					onHide={onHide}
				/>
			)}
			{operation === 'Rewards' && <Rewards pid={farm.pid} />}
		</div>
	)
}

export default Actions
