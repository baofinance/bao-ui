/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import useDistributionInfo, { DistributionInfo } from '@/hooks/distribution/useDistributionInfo'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { parseUnits } from 'ethers/lib/utils'
import 'katex/dist/katex.min.css'
import Image from 'next/future/image'
import React, { useState } from 'react'

const slashFunction = (days: number) => {
	let p = 0
	if (0 <= days && days <= 365) {
		p = 100 - 0.01369863013 * days
	} else if (365 < days && days <= 1095) {
		p = 95
	}
	return p / 100
}

const slashableTokens = (distributionInfo: DistributionInfo) => {
	const startDate = new Date(distributionInfo.dateStarted.mul(1000).toNumber())
	const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 3600 * 24))
	const slashRate = slashFunction(daysSinceStart)
	const tokensLeft = distributionInfo.amountOwedTotal.sub(distributionInfo.curve)
	const tokensToSlash = decimate(tokensLeft.mul(parseUnits(slashRate.toString())))
	return tokensToSlash
}

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()
	const distribution = useContract<BaoDistribution>('BaoDistribution')
	const distributionInfo = useDistributionInfo()

	const [showModal, setShowModal] = useState(false)
	//const [seenModal, setSeenModal] = useState(false)

	const modalShow = () => {
		setShowModal(true)
	}
	const modalHide = () => {
		//setSeenModal(true)
		setShowModal(false)
	}

	const tokensToSlash = slashableTokens(distributionInfo)
	const tokensYouGet = distributionInfo.curve.add(distributionInfo.amountOwedTotal.sub(tokensToSlash))

	return (
		<div className='flex flex-col px-4'>
			<div className='flex flex-col'>
				<Typography variant='hero' className='my-3 text-center font-bakbak'>
					End Distribution
				</Typography>
				<Typography variant='xl' className='text-center font-bakbak'>
					Receive tokens early at a cost
				</Typography>
				<Typography variant='p' className='my-4 leading-normal'>
					Users that perform a liquid distribution can choose to end their distribution early at any time after their distribution starts. A
					large slashing penalty will be applied to the tokens unlocked early, while all tokens already unlocked have no slash fee applied.
					The slash fee is based on the slash rate function defined below which will end the distribution and allow the user to receive the
					rest of their tokens (minus slash fee) immediately.
				</Typography>
				<Typography variant='lg' className='mt-2 mb-2 font-bakbak text-baoWhite'>
					Slash Function
				</Typography>
				<code>
					X = days since start of distribution
					<br />
					{'0 <= X <= 365 || (100 -.01369863013x)'}
					<br />
					{'365 < X <= 1095 || 95'}
				</code>
				<Typography variant='p' className='my-4 leading-normal'>
					The slash function starts on the date the user begins their BAO distribution. The slash function begins at 100% on day 0 and
					approaches a constant 95% slash on day 365 and later. The slash function defines how much of their remaining distribution gets
					slashed when a user ends their distribution early. The user will immediately receive the remainder of this percentage of their
					remaining distribution. The slash function value is multiplied against your remaining distribution amount and the result is lost
					to your forever.
				</Typography>

				<div className='flex flex-col my-4 gap-5'>
					<div className='flex flex-col justify-center gap-2 rounded'>
						<Typography variant='base' className='text-md flex flex-row font-bakbak text-baoWhite'>
							Tokens that will be slashed (lost) if you end your distribution early:
						</Typography>
						<div className='flex flex-row items-center gap-2'>
							<Image src='/images/tokens/BAO.png' height={24} width={24} alt='BAO' />
							<Typography variant='base' className='font-bakbak'>
								{getDisplayBalance(tokensToSlash)}
							</Typography>
						</div>
					</div>
					<div className='flex flex-col justify-center gap-2 rounded'>
						<Typography variant='base' className='text-md flex flex-row font-bakbak text-baoWhite'>
							Your new distribution total (including tokens pending claim or already claimed):
						</Typography>
						<div className='flex flex-row items-center gap-2'>
							<Image src='/images/tokens/BAO.png' height={24} width={24} alt='BAO' />
							<Typography variant='base' className='font-bakbak'>
								{getDisplayBalance(tokensYouGet)}
							</Typography>
						</div>
					</div>
				</div>

				<Typography variant='p' className='my-4 leading-normal'>
					If you choose this option and end your distribution early, you will instantly receive the new distribution total amount that you
					see above, minus any tokens you've already claimed. We include any tokens that are currently pending claim, so you don't need to worry about that.
				</Typography>

				<div className='m-auto mt-2 flex w-full flex-col items-center justify-center'>
					<a
						href='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/d0683e4c31a1d5cbfdf4a1a23f76325ca884ee43.gif'
						target='_blank'
						rel='noreferrer noopener'
					>
						<Image
							width={624}
							height={243}
							src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/d0683e4c31a1d5cbfdf4a1a23f76325ca884ee43.gif'
							className='max-h-[400px] w-min rounded'
							alt='Slash function'
						/>
					</a>
					<Typography variant='xs' className='my-4 rounded bg-background-100 p-2 text-center text-baoRed'>
						In the graph above, the blue points are the state of both curves respectively. The orange point is the percentage of their total
						distribution that the user will be able to claim if they choose to end their distribution at that point.
					</Typography>
				</div>
			</div>

			<div className='w-2/5 flex-1 self-center'>
				<Button
					className='my-4'
					fullWidth
					onClick={async () => {
						modalShow()
					}}
				>
					End Distribution
				</Button>
			</div>

			<Modal isOpen={showModal} onDismiss={modalHide}>
				<Modal.Header
					onClose={modalHide}
					header={
						<>
							<Typography variant='h2' className='inline-block font-bakbak text-red'>
								Warning!
							</Typography>
						</>
					}
				/>
				<Modal.Body>
					<Typography variant='xl' className='pb-2 font-bakbak'>
						This is action is irreversible and forfeits tokens!
					</Typography>
					<Typography variant='p' className='leading-normal'>
						End your distribution and collect a slashed amount of your locked BAO tokens instantly.
					</Typography>
					<Typography variant='p' className='leading-normal'>
						Ending your distribution comes at the cost of forever forfeiting a large portion of the tokens you would have received by
						migrating or claiming over time.
					</Typography>
					<Typography variant='p' className='leading-normal'>
						By clicking the button below, you acknowledge that you've read the information on this page very carefully and understand that
						ending your distribution is an irreversible action!
					</Typography>

					<div className='flex flex-col items-center'>
						<div className='flex flex-col'>
							<div className='my-2 flex w-full flex-row items-center justify-center gap-4'>
								<div className='flex flex-col gap-2'>
									<div className='flex h-8 flex-row items-center justify-center gap-2 rounded px-2'>
										<Typography variant='base' className='text-md px-2 font-bakbak text-baoWhite'>
											BAO you will forfeit due to slashing:
										</Typography>
										<Image src='/images/tokens/BAO.png' height={24} width={24} alt='BAO' />
										<Typography variant='base' className='font-bakbak'>
											{getDisplayBalance(tokensToSlash)}
										</Typography>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className='flow-col mt-3 flex items-center gap-3'>
						<Button
							fullWidth
							onClick={async () => {
								const endDistribution = distribution.endDistribution()
								handleTx(endDistribution, `Distribution: End Distribution`)
							}}
						>
							I understand the risk!
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	)
}

export default Migration
