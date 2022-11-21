import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { getDayOffset, getWeekDiff } from '@/utils/date'
import 'katex/dist/katex.min.css'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { useState } from 'react'

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()

	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1))
	const min = getDayOffset(new Date(), 365 * 3 - 7)
	const max = getWeekDiff(min, getDayOffset(new Date(), 365 * 4 - 7))
	const [weeks, setWeeks] = useState<number>(max)

	const onSliderChange = (value: number | number[]) => {
		setWeeks(value as number)
		setLockTime(getDayOffset(min, (value as number) * 7))
	}

	return (
		<div className='flex flex-col px-4'>
			<Typography variant='hero' className='my-3 text-center font-bold'>
				Migrate
			</Typography>
			<Typography variant='xl' className='text-center font-bold'>
				Locked BAO to veBAO
			</Typography>
			<Typography variant='p' className='mt-5 leading-normal'>
				With this option, you may choose to lock your balance directly into vote escrowed BAO (veBAO) for a minimum of 3 years or the length
				of the chosen lock period. After you choose to lock into veBAO, you will no longer be able to participate in streaming of liquid BAO
				tokens as all the tokens from your distribution will be converted to a locked veBAO balance. Locking into veBAO relinquishes access
				to your tokens as they will be locked, but you will get the benefits of having veBAO. veBAO gives ownership of a percentage of
				protocol fees and the ability to vote on governance proposals.
			</Typography>
			<Typography variant='p' className='leading-normal'>
				Tokens locked into veBAO will <b className='font-bold'>not</b> be subject to any slashing penalty.
			</Typography>
			<Typography variant='p' className='leading-normal'>
				When you select a date and click the migrate button below this text, your locked BAOv2 will be migrated to veBAO and locked until
				the selected date. Note that the amount of veBAO you recieve will be amplified by the length of the lock that you to choose.
			</Typography>
			<div className='m-auto flex w-[360px] flex-col items-center justify-center'>
				<Slider
					max={max}
					value={weeks}
					onChange={onSliderChange}
					className='mt-4'
					handleStyle={{
						backgroundColor: '#FFD84B',
						borderColor: '#FFD84B',
						boxShadow: 'none',
						opacity: 1,
					}}
					trackStyle={{
						backgroundColor: '#CC9902',
						borderColor: '#CC9902',
					}}
					railStyle={{
						backgroundColor: '#622a2a',
					}}
				/>
				<Typography variant='sm' className='text-center'>
					Lock until {new Date(lockTime).toDateString()}
				</Typography>
			</div>

			<div className='m-auto w-2/5 flex-1'>
				<Button
					className='my-4'
					fullWidth
					onClick={async () => {
						const lockDistribution = distribution.lockDistribution(length.toString().slice(0, 10))
						handleTx(lockDistribution, `Distribution: Migrate to veBAO`)
					}}
				>
					Migrate to veBAO
				</Button>
			</div>
			<Typography variant='sm' className='m-auto text-text-200'>
				* This action can be done only <b className='font-bold'>once</b> and can <b className='font-bold'>not</b> be reversed!
			</Typography>
		</div>
	)
}

export default Migration
