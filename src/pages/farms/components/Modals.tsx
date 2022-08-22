import { NavButtons } from '@/components/Button'
import Loader from '@/components/Loader'
import Modal, { ModalProps } from '@/components/Modal'
import { FeeBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import useBao from '@/hooks/base/useBao'
import useBlockDiff from '@/hooks/base/useBlockDiff'
import useTokenBalance from '@/hooks/base/useTokenBalance'
import useFees from '@/hooks/farms/useFees'
import useStakedBalance from '@/hooks/farms/useStakedBalance'
import { useUserFarmInfo } from '@/hooks/farms/useUserFarmInfo'
import { getContract } from '@/utils/erc20'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import { Rewards, Stake, Unstake } from './Actions'
import { FarmWithStakedValue } from './FarmList'

type FarmModalProps = {
	farm: FarmWithStakedValue
	show: boolean
	onHide: () => void
}

export const FarmModal: React.FC<FarmModalProps> = ({ farm, show, onHide }) => {
	const operations = ['Stake', 'Unstake', 'Rewards']
	const [operation, setOperation] = useState(operations[0])
	const { pid } = farm
	const bao = useBao()

	const lpTokenAddress = farm.lpTokenAddress

	const lpContract = useMemo(() => {
		return getContract(bao, lpTokenAddress)
	}, [bao, lpTokenAddress])

	const tokenBalance = useTokenBalance(lpContract.options.address)
	const stakedBalance = useStakedBalance(pid)

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header onClose={hideModal}>
				<div className='mx-0 my-auto flex h-full items-center justify-center align-middle text-text-100'>
					<Typography variant='xl' className='mr-1 inline-block font-semibold'>
						{operation}
					</Typography>
					{operation !== 'Rewards' && (
						<>
							<img className='z-10 inline-block h-8 w-8 select-none duration-200' src={farm.iconA} />
							{farm.iconB !== null && <img className='z-20 -ml-2 inline-block h-8 w-8 select-none duration-200' src={farm.iconB} />}
						</>
					)}
				</div>
			</Modal.Header>
			<Modal.Options>
				<NavButtons options={operations} active={operation} onClick={setOperation} />
			</Modal.Options>
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
		</Modal>
	)
}

interface FeeModalProps {
	pid: number
	show: boolean
	onHide: () => void
}

export const FeeModal: React.FC<FeeModalProps> = ({ pid, show, onHide }) => {
	const userInfo = useUserFarmInfo(pid)
	const blockDiff = useBlockDiff(userInfo)
	const fees = useFees(blockDiff)
	const lastInteraction = blockDiff && new Date(new Date().getTime() - 1000 * (blockDiff * 3)).toLocaleString()

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal}>
			<Modal.Header onBack={hideModal}>
				<Typography variant='xl' className='mr-1 inline-block font-semibold'>
					Fee Details
				</Typography>
			</Modal.Header>
			<Modal.Body>
				<Typography className='text-center mb-2'>
					<span role='img' aria-label='important'>
						❗
					</span>
					BE AWARE OF WITHDRAWAL FEES
					<span role='img' aria-label='important'>
						❗
					</span>
				</Typography>
				<FeeBlock
					label=''
					stats={[
						{
							label: 'Current Fee:',
							value: `${fees ? `${(fees * 100).toFixed(2)}%` : <Loader />}`,
						},
						{
							label: 'Last interaction:',
							value: `
						${lastInteraction ? lastInteraction.toString() : <Loader />}
						`,
						},
						{
							label: 'Blocks passed:',
							value: `${blockDiff ? blockDiff : <Loader />}`,
						},
						{
							label: 'Last withdraw block:',
							value: `
						${userInfo ? userInfo.lastWithdrawBlock === '0' ? 'Never Withdrawn' : userInfo.lastWithdrawBlock : <Loader />}
						`,
						},
					]}
				/>
					<Typography className='mt-2'>
						Your first deposit activates and each withdraw resets the timer for penalities and fees, this is pool based. Be sure to read the{' '}
						<Link href='https://docs.bao.finance/' target='_blank' rel='noopener noreferrer'>
							<a className='font-semibold'>docs</a>
						</Link>{' '}
						before using the farms so you are familiar with protocol risks and fees!
					</Typography>
			</Modal.Body>
		</Modal>
	)
}
