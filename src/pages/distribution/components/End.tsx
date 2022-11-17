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
					End Early
				</Typography>
				<Typography variant='xl' className='text-center font-bold'>
					Receive Remaining Locked BAO at Reduced Rate
				</Typography>
				<Typography variant='p' className='my-5 leading-normal'>
					Users that perform a liquid distribution can choose to end their distribution early at any time after the distribution starts. A
					large slashing penalty will be applied to the tokens unlocked early, while all tokens already unlocked have no slash fee applied.
					The slash fee is based on the slash rate function defined below which will end their distribution and allow them to receive the
					rest of their tokens (minus slash fee) immediately.
				</Typography>
				<Typography variant='lg' className='mt-2 mb-2 font-bold'>
					Slash Function
				</Typography>
				<code>
					X = days since start of distribution
					<br />
					{'0 <= X <= 365 || (100 -.01369863013x)'}
					<br />
					{'365 <X <= 1095 || 95'}
				</code>
				<Typography variant='p' className='my-5 leading-normal'>
					The slash function starts at the same date the address selects to start their BAO distribution. The slash function starts at 100%
					on day 0, and approaches a constant 95% slash on day 365 and thereafter. On the day that the user chooses to end their
					distribution early, the slash function defines how much of their remaining distribution will be slashed. The user will receive the
					remainder of this percentage of their remaining distribution immediately.
				</Typography>
				<div className='m-auto mt-2 flex w-full flex-col items-center justify-center'>
					<Typography variant='sm' className='mb-1 text-center text-text-200'>
						Click the image to open a larger version of the photo.
					</Typography>
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
					<Typography variant='sm' className='my-2 text-center text-text-200'>
						In the graph above, the blue points are the state of both curves respectively. The orange point is the percentage of their total
						distribution that the user will be able to claim if they choose to end their distribution at that point.
					</Typography>

					<Typography variant='p' className='my-5 leading-normal'>
						You can read more about this process and the math behind it by checking out{' '}
						<a
							className='font-medium text-text-300 hover:text-text-400'
							href='https://gov.bao.finance/t/bip-14-token-migration-distribution/1140'
							target='_blank'
							rel='noreferrer'
						>
							BIP-14
						</a>{' '}
						on our governance forums.
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

			<Typography variant='sm' className='text-right text-text-200'>
				* This action can be done only *once* and can NOT be reversed!
			</Typography>
		</div>
	)
}

export default Migration
