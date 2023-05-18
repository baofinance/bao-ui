import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Typography from '@/components/Typography'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useClaimableFees from '@/hooks/vebao/useClaimableFees'
import { LockInfo } from '@/hooks/vebao/useLockInfo'
import { useNextDistribution } from '@/hooks/vebao/useNextDistribution'
import { VeInfo } from '@/hooks/vebao/useVeInfo'
import { Baov2 } from '@/typechain/Baov2'
import { FeeDistributor } from '@/typechain/FeeDistributor'
import { providerKey } from '@/utils/index'
import { decimate, exponentiate, getDisplayBalance, truncateNumber } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
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
	veInfo?: VeInfo
	timestamp?: BigNumber
}

function addDays(numOfDays: number, date = new Date()) {
	date.setDate(date.getDate() + numOfDays)

	return date
}

const LockStats = ({ lockInfo, timestamp }: StatsProps) => {
	const { account } = useWeb3React()
	const { pendingTx, txHash, handleTx } = useTransactionHandler()
	const claimableFees = useClaimableFees()
	const feeDistributor = useContract<FeeDistributor>('FeeDistributor')

	return (
		<div className='col-span-2 grid'>
			<Typography variant='xl' className='mb-4 text-center font-bakbak'>
				Lock Info
			</Typography>
			<div className='glassmorphic-card grid h-full grid-rows-5 items-center rounded px-8 py-6'>
				<div className='grid grid-cols-2 items-center gap-1'>
					<Typography variant='lg' className='font-bakbak'>
						Earned Rewards
					</Typography>
					<div className='flex justify-end'>
						<div className='flex h-10 items-center justify-center'>
							<Typography variant='lg' className='ml-2 inline font-bakbak'>
								${claimableFees ? getDisplayBalance(claimableFees) : 0}
							</Typography>
							<Image src='/images/tokens/baoUSD.png' alt='BAO' width={16} height={16} className='ml-1 mr-2 inline' />
						</div>

						<Button
							size='xs'
							disabled={!claimableFees || claimableFees.lte(0)}
							onClick={async () => {
								const harvestTx = feeDistributor['claim(address)'](account)
								handleTx(harvestTx, `veBAO: Claim ${getDisplayBalance(claimableFees)} baoUSD`)
							}}
							pendingTx={pendingTx}
							txHash={txHash}
							className='my-auto ml-1'
						>
							Claim
						</Button>
					</div>
				</div>
				<div className='grid gap-1 md:grid-cols-2'>
					<Typography variant='lg' className='font-bakbak'>
						veBAO APR
					</Typography>
					<>
						<Typography variant='lg' className='ml-2 inline text-end font-bakbak'>
							-
						</Typography>
					</>
				</div>
				<div className='grid gap-1 md:grid-cols-2'>
					<Typography variant='lg' className='font-bakbak'>
						veBAO Balance
					</Typography>
					<>
						<Typography variant='lg' className='ml-2 inline text-end font-bakbak'>
							{account && !isNaN(lockInfo && parseFloat(formatUnits(lockInfo.balance)))
								? window.screen.width > 1200
									? getDisplayBalance(lockInfo && lockInfo.balance)
									: truncateNumber(lockInfo && lockInfo.balance)
								: '-'}
						</Typography>
					</>
				</div>
				<div className='grid gap-1 md:grid-cols-2'>
					<Typography variant='lg' className='font-bakbak'>
						BAO Locked
					</Typography>
					<>
						<Typography variant='lg' className='ml-2 inline text-end font-bakbak'>
							<>{lockInfo ? getDisplayBalance(lockInfo.lockAmount) : '-'}</>
						</Typography>
					</>
				</div>

				<div className='grid gap-1 md:grid-cols-2'>
					<Typography variant='lg' className='font-bakbak'>
						Locked Until
					</Typography>
					<>
						<Typography variant='lg' className='ml-2 inline text-end font-bakbak'>
							{!account || (lockInfo && timestamp && lockInfo.lockEnd.mul(1000).lt(timestamp))
								? '-'
								: new Date(lockInfo && lockInfo.lockEnd.mul(1000).toNumber()).toDateString()}
						</Typography>
					</>
				</div>
			</div>
		</div>
	)
}

export default LockStats

export const ProtocolStats = ({ veInfo, baoPrice }: StatsProps) => {
	const { library, account, chainId } = useWeb3React()
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
	if (veInfo && totalSupply && totalSupply.gt(0)) {
		const lockSupplyPercent = exponentiate(veInfo.totalSupply.mul(100))
		suppliedPercentage = lockSupplyPercent.div(totalSupply)
	}

	const nextFeeDistribution = useNextDistribution()
	const ratio = veInfo ? parseFloat(formatUnits(veInfo.supply)) / parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const avgLock = veInfo ? Math.round(ratio * 4 * 100) / 100 : 0

	const enabled = !!library
	const { data: timestamp, refetch } = useQuery(
		['block timestamp', providerKey(library, account, chainId)],
		async () => {
			const block = await library.getBlock()
			return block.timestamp as BigNumber
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	//useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 1)

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Protocol Statistics
			</Typography>
			<Card className='glassmorphic-card p-4'>
				<Card.Body>
					<div className='grid w-full grid-cols-12 gap-4 px-4 pt-2 !text-center'>
						<div className='col-span-4'>
							<div className='grid h-full grid-rows-2 gap-4'>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Total Value Locked
									</Typography>
									<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
										${veInfo && baoPrice ? getDisplayBalance(decimate(veInfo.totalSupply.mul(baoPrice))) : 0}
									</Typography>
								</div>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Total veBAO Supply
									</Typography>
									<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
										{veInfo && `${getDisplayBalance(veInfo.totalSupply)}`}
									</Typography>
								</div>
							</div>
						</div>
						<div className='col-span-4'>
							<div className='grid h-full grid-rows-2 gap-4'>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Average Lock Time
									</Typography>
									<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
										{avgLock ? avgLock : 0} Years
									</Typography>
								</div>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										% of BAO Locked
									</Typography>
									<div>
										<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
											{suppliedPercentage ? `${getDisplayBalance(suppliedPercentage)}%` : '-'}
										</Typography>
									</div>
								</div>
							</div>
						</div>
						<div className='col-span-4'>
							<div className='grid h-full grid-rows-2 gap-4'>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Next Distribution
									</Typography>
									<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
										{account && nextFeeDistribution && timestamp && nextFeeDistribution.mul(1000).lte(timestamp)
											? addDays(1, new Date(nextFeeDistribution.mul(1000).toNumber())).toDateString()
											: `-`}
									</Typography>
								</div>
								<div className='row-span-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Average Weekly Earnings
									</Typography>
									<div>
										<Typography variant='xl' className='m-auto inline-block align-middle font-bakbak text-baoWhite'>
											-
										</Typography>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card.Body>
			</Card>
		</>
	)
}

export const ProtocolStatsHoriz = ({ veInfo, timestamp, baoPrice }: StatsProps) => {
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
	if (veInfo && totalSupply && totalSupply.gt(0)) {
		const lockSupplyPercent = exponentiate(veInfo.totalSupply.mul(100))
		suppliedPercentage = lockSupplyPercent.div(totalSupply)
	}

	const nextFeeDistribution = useNextDistribution()
	const ratio = veInfo ? parseFloat(formatUnits(veInfo.supply)) / parseFloat(formatUnits(veInfo.totalSupply)) : 0
	const avgLock = veInfo ? Math.round(ratio * 4 * 100) / 100 : 0

	return (
		<div>
			<Typography variant='xl' className='mt-4 font-bakbak'>
				Protocol Statistics
			</Typography>
			<div
				className={`my-2 grid w-full grid-flow-col ${
					isDesktop ? 'grid-rows-1 gap-4' : 'grid-rows-3 gap-2'
				} justify-evenly rounded border  bg-opacity-80 p-4`}
			>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-baoRed'>
							Total Value Locked
						</Typography>
					</div>
					<Typography>
						<Typography variant='lg' className='font-bakbak'>
							${veInfo && baoPrice ? getDisplayBalance(decimate(veInfo.totalSupply.mul(baoPrice))) : 0}
						</Typography>
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-baoRed'>
							Percentage of BAO Locked
						</Typography>
					</div>
					<Typography variant='lg' className='font-bakbak'>
						{suppliedPercentage ? `${getDisplayBalance(suppliedPercentage)}%` : '-'}
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-baoRed'>
							Average Lock Time
						</Typography>
					</div>
					<Typography variant='lg' className='font-bakbak'>
						{avgLock ? avgLock : 0} Years
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-baoRed'>
							Next Distribution
						</Typography>
					</div>
					<Typography variant='lg' className='font-bakbak'>
						{account && nextFeeDistribution && timestamp && nextFeeDistribution.mul(1000).lte(timestamp)
							? addDays(1, new Date(nextFeeDistribution.mul(1000).toNumber())).toDateString()
							: `-`}
					</Typography>
				</div>
				<div className='items-center justify-center text-center'>
					<div className='text-center'>
						<Typography variant='xs' className='text-baoRed'>
							Average Weekly Earnings
						</Typography>
					</div>
					<Typography variant='lg' className='font-bakbak'>
						-
					</Typography>
				</div>
			</div>
		</div>
	)
}
