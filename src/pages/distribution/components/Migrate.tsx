/* eslint-disable react/no-unescaped-entities */
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { getDayOffset, getEpochSecondForDay, getWeekDiff } from '@/utils/date'
import 'katex/dist/katex.min.css'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { useState } from 'react'
import Modal from '@/components/Modal'

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()

	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const [lockTime, setLockTime] = useState<Date>(getDayOffset(new Date(), 365 * 4 - 1))
	const min = getDayOffset(new Date(), 365 * 3)
	const max = getWeekDiff(min, getDayOffset(new Date(), 365 * 4 - 7))
	const [weeks, setWeeks] = useState<number>(max)

	const onSliderChange = (value: number | number[]) => {
		setWeeks(value as number)
		setLockTime(getDayOffset(min, (value as number) * 7))
	}

	const [showModal, setShowModal] = useState(false)
	const [seenModal, setSeenModal] = useState(false)

	const modalShow = () => {
		setShowModal(true)
	}
	const modalHide = () => {
		setSeenModal(true)
		setShowModal(false)
	}

	const shouldBeWarned = !seenModal

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
						if (shouldBeWarned) {
							modalShow()
						} else {
							const lockDistribution = distribution.lockDistribution(getEpochSecondForDay(lockTime))
							handleTx(lockDistribution, `Distribution: Migrate to veBAO`)
						}
					}}
				>
					{shouldBeWarned ? 'Read Warning' : 'Migrate to veBAO'}
				</Button>
			</div>
			<Typography variant='sm' className='m-auto text-text-200'>
				* This action can be done only <b className='font-bold'>once</b> and can <b className='font-bold'>not</b> be reversed!
			</Typography>

			<Modal isOpen={showModal} onDismiss={modalHide}>
				<Modal.Header
					onClose={modalHide}
					header={
						<Typography variant='h2' className='inline-block font-semibold'>
							Warning!
						</Typography>
					}
				/>
				<Modal.Body>
					<Typography variant='xl' className='pb-5 font-semibold text-text-300'>
						This action is IRREVERSIBLE
					</Typography>
					<Typography variant='base' className='leading-normal'>
						This action converts all of the locked BAO tokens in your distribution into veBAO instantly.
						<br />
						<br />
						This migration can only happen once and can never be undone.
						<br />
						<br />
						If you take this action it will end your distribution and you will be unable to take any further distribution actions.
					</Typography>
					<div className='flow-col mt-5 flex items-center gap-3'>
						<Button fullWidth onClick={modalHide}>
							I understand the risk!
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	)
}

export default Migration
