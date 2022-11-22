import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useClaimableFees from '@/hooks/vebao/useClaimableFees'
import { LockInfo } from '@/hooks/vebao/useLockInfo'
import { useNextDistribution } from '@/hooks/vebao/useNextDistribution'
import { Baov2 } from '@/typechain/Baov2'
import { FeeDistributor } from '@/typechain/FeeDistributor'
import { decimate, exponentiate, getDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'

type StatsProps = {
	baoBalance?: BigNumber
	baoPrice?: BigNumber
	lockInfo?: LockInfo
	timestamp?: BigNumber
}

function addDays(numOfDays: number, date = new Date()) {
	date.setDate(date.getDate() + numOfDays)

	return date
}

const LockStats = ({ lockInfo, timestamp }: StatsProps) => {
	const { account, chainId } = useWeb3React()
	const { pendingTx, handleTx } = useTransactionHandler()
	const claimableFees = useClaimableFees()
	const feeDistributor = useContract<FeeDistributor>('FeeDistributor', Config.contracts.FeeDistributor[chainId].address)

	return (
		<div className='col-span-2 grid h-full grid-rows-6 items-center rounded border border-primary-300 bg-primary-100 p-4'>
			<Typography variant='xl' className='mb-4 text-center font-bold'>
				Lock Info
			</Typography>
			<div className='grid grid-cols-2 items-center gap-1'>
				<Typography className='font-medium text-text-200'>Earned Rewards</Typography>
				<div className='flex justify-end'>
					<div className='-mr-1 flex h-10 items-center justify-center rounded-l bg-primary-400'>
						<Typography className='ml-2 inline font-semibold'>${claimableFees ? getDisplayBalance(claimableFees) : 0}</Typography>
						<Image src='/images/tokens/baoUSD.png' alt='BAO' width={16} height={16} className='ml-1 mr-2 inline' />
					</div>
					{pendingTx ? (
						<Button className='rounded-l-none border-0' disabled={true}>
							Claim
						</Button>
					) : (
						<Button
							size='sm'
							onClick={async () => {
								const harvestTx = feeDistributor['claim(address)'](account)
								handleTx(harvestTx, `veBAO: Claim ${getDisplayBalance(claimableFees)} baoUSD`)
							}}
							className='rounded-l-none border-0 text-base'
						>
							Claim
						</Button>
					)}
				</div>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography className='font-medium text-text-200'>veBAO APR</Typography>
				<>
					<Typography className='ml-1 inline text-end font-bold'>-</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography className='font-medium text-text-200'>BAO Locked</Typography>
				<>
					<Typography className='ml-1 inline text-end font-bold'>
						<>{lockInfo ? getDisplayBalance(lockInfo.lockAmount) : '-'}</>
					</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography className='font-medium text-text-200'>veBAO Balance</Typography>
				<>
					<Typography className='ml-1 inline text-end font-bold'>
						{account && !isNaN(lockInfo && parseFloat(formatUnits(lockInfo.balance)))
							? window.screen.width > 1200
								? getDisplayBalance(lockInfo && lockInfo.balance)
								: truncateNumber(lockInfo && lockInfo.balance)
							: '-'}
					</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography className='font-medium text-text-200'>Locked Until</Typography>
				<>
					<Typography className='ml-1 inline text-end font-bold'>
						{!account || (lockInfo && lockInfo.lockEnd.mul(1000).lt(timestamp))
							? '-'
							: new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber()).toDateString()}
					</Typography>
				</>
			</div>
		</div>
	)
}

export default LockStats

export const ProtocolStats = ({ lockInfo, timestamp, baoPrice }: StatsProps) => {
	const { chainId } = useWeb3React()
	const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0))
	const baoV2 = useContract<Baov2>('Baov2', Config.contracts.Baov2[chainId].address)

	useEffect(() => {
		const fetchTotalSupply = async () => {
			const supply = await baoV2.totalSupply()
			setTotalSupply(supply)
		}
		if (baoV2) fetchTotalSupply()
	}, [baoV2, setTotalSupply])

	let suppliedPercentage
	if (lockInfo && totalSupply && totalSupply.gt(0)) {
		const lockSupplyPercent = exponentiate(lockInfo.totalSupply.mul(100))
		suppliedPercentage = lockSupplyPercent.div(totalSupply)
	}

	const nextFeeDistribution = useNextDistribution()
	const ratio = lockInfo ? parseFloat(formatUnits(lockInfo.supply)) / parseFloat(formatUnits(lockInfo.totalSupply)) : 0
	const avgLock = lockInfo ? Math.round(ratio * 4 * 100) / 100 : 0

	return (
		<div className='grid h-full grid-rows-6 items-center justify-end rounded border border-primary-300 bg-primary-100 p-4'>
			<Typography className='mb-4 text-center font-bold'>Protocol Statistics</Typography>
			<div className='grid grid-cols-2 items-center gap-1'>
				<Typography variant='sm' className='text-text-200'>
					Total Value Locked
				</Typography>
				<>
					<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
						${lockInfo && baoPrice ? getDisplayBalance(decimate(lockInfo.totalSupply.mul(baoPrice.mul(1000)))) : 0}
					</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography variant='sm' className='text-text-200'>
					Percentage of BAO Locked
				</Typography>
				<>
					<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
						{suppliedPercentage && `${getDisplayBalance(suppliedPercentage)}%`}
					</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography variant='sm' className='text-text-200'>
					Average Lock Time
				</Typography>
				<>
					<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
						{avgLock ? avgLock : 0} Years
					</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography variant='sm' className='text-text-200'>
					Next Distribution
				</Typography>
				<>
					<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
						{nextFeeDistribution && nextFeeDistribution.mul(1000).lte(timestamp)
							? addDays(1, new Date(nextFeeDistribution.mul(1000).toNumber())).toDateString()
							: `-`}
					</Typography>
				</>
			</div>
			<div className='grid grid-cols-2 gap-1'>
				<Typography variant='sm' className='text-text-200'>
					Average Weekly Earnings
				</Typography>
				<>
					<Typography variant='sm' className='ml-1 inline text-end font-semibold'>
						-
					</Typography>
				</>
			</div>
		</div>
	)
}

export const ProtocolStatsHoriz = ({ lockInfo, timestamp, baoPrice }: StatsProps) => {
	const { account, chainId } = useWeb3React()
	const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0))
	const baoV2 = useContract<Baov2>('Baov2', Config.contracts.Baov2[chainId].address)

	useEffect(() => {
		const fetchTotalSupply = async () => {
			const supply = await baoV2.totalSupply()
			setTotalSupply(supply)
		}
		if (baoV2) fetchTotalSupply()
	}, [baoV2, setTotalSupply])

	let suppliedPercentage
	if (lockInfo && totalSupply && totalSupply.gt(0)) {
		const lockSupplyPercent = exponentiate(lockInfo.totalSupply.mul(100))
		suppliedPercentage = lockSupplyPercent.div(totalSupply)
	}

	const nextFeeDistribution = useNextDistribution()
	const ratio = lockInfo ? parseFloat(formatUnits(lockInfo.supply)) / parseFloat(formatUnits(lockInfo.totalSupply)) : 0
	const avgLock = lockInfo ? Math.round(ratio * 4 * 100) / 100 : 0

	return (
		<div>
			<Typography variant='xl' className='mt-4 font-bold'>
				Protocol Statistics
			</Typography>
			<div
				className={`my-2 grid w-full grid-flow-col ${
					isDesktop ? 'grid-rows-1 gap-4' : 'grid-rows-2 gap-2'
				} justify-evenly rounded border border-primary-300 bg-primary-100 bg-opacity-80 p-4`}
			>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Total Value Locked
						</Typography>
					</div>
					<Typography>
						<Typography variant='lg' className='font-bold'>
							${lockInfo && baoPrice ? getDisplayBalance(decimate(lockInfo.totalSupply.mul(baoPrice.mul(1000)))) : 0}
						</Typography>
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Percentage of BAO Locked
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						{suppliedPercentage ? `${getDisplayBalance(suppliedPercentage)}%` : '-'}
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Average Lock Time
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						{avgLock ? avgLock : 0} Years
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Next Distribution
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						{account && nextFeeDistribution && nextFeeDistribution.mul(1000).lte(timestamp)
							? addDays(1, new Date(nextFeeDistribution.mul(1000).toNumber())).toDateString()
							: `-`}
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-text-200'>
							Average Weekly Earnings
						</Typography>
					</div>
					<Typography variant='lg' className='font-bold'>
						-
					</Typography>
				</div>
			</div>
		</div>
	)
}
