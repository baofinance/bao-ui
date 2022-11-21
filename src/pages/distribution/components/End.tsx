import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import 'katex/dist/katex.min.css'
import Image from 'next/future/image'
import React from 'react'

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()
	const distribution = useContract<BaoDistribution>('BaoDistribution')

	return (
		<div className='flex flex-col px-4'>
			<div className='flex flex-col'>
				<Typography variant='hero' className='my-3 text-center font-bold'>
					End Distribution
				</Typography>
				<Typography variant='xl' className='text-center font-bold'>
					End the Distribution Early
				</Typography>
				<Typography variant='p' className='my-4 leading-normal'>
					Users that perform a liquid distribution can choose to end their distribution early at any time after their distribution starts. A
					large slashing penalty will be applied to the tokens unlocked early, while all tokens already unlocked have no slash fee applied.
					The slash fee is based on the slash rate function defined below which will end the distribution and allow the user to receive the
					rest of their tokens (minus slash fee) immediately.
				</Typography>
				<Typography variant='lg' className='mt-2 mb-2 font-medium text-text-200'>
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
					remaining distribution.
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
					<Typography variant='xs' className='my-4 w-4/5 rounded bg-background-100 p-2 text-center text-text-200'>
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
						const endDistribution = distribution.endDistribution()
						handleTx(endDistribution, `Distribution: End Distribution`)
					}}
				>
					End Distribution
				</Button>
			</div>

			<Typography variant='sm' className='text-center text-text-200'>
				* This action can be done only <b className='font-bold'>once</b> and can <b className='font-bold'>not</b> be reversed!
			</Typography>
		</div>
	)
}

export default Migration
