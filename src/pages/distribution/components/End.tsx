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
		<>
			<div className='flex flex-col'>
				<Typography variant='p'>
					Users that perform a liquid distribution can choose to end their distribution early at any time after the distribution starts. A
					large slashing penalty will be applied to the tokens unlocked early, while all tokens already unlocked have no slash fee applied.
					The slash fee is based on the slash rate function defined below which will end their distribution and allow them to receive the
					rest of their tokens (minus slash fee) immediately.
				</Typography>
				<Typography variant='lg' className='mt-2 mb-2 font-bold'>
					Slash Function
				</Typography>
				<code>X = days since start of distribution</code>
				<code>{'0 <= X <= 365 || (100 -.01369863013x)'}</code>
				<code>{'365 <X <= 1095 || 95'}</code>
				<Typography variant='p'>
					The slash function starts at the same date the address selects to start their BAO distribution. The slash function starts at 100%
					on day 0, and approaches a constant 95% slash on day 365 and thereafter. On the day that the user chooses to end their
					distribution early, the slash function defines how much of their remaining distribution will be slashed. The user will receive the
					remainder of this percentage of their remaining distribution immediately.
				</Typography>
				<div className='m-auto mt-2 flex w-1/2 flex-col items-center justify-center'>
					<Image
						width={624}
						height={243}
						src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/d0683e4c31a1d5cbfdf4a1a23f76325ca884ee43.gif'
						className='max-h-[400px] w-min rounded'
						alt='Slash function'
					/>
					<Typography variant='xs' className='mt-2 text-center text-text-200'>
						In the graph above, the blue points are the state of both curves respectively. The orange point is the percentage of their total
						distribution that the user will be able to claim if they choose to end their distribution at that point.
					</Typography>
				</div>
			</div>
			<Button
				fullWidth
				onClick={async () => {
					const endDistribution = distribution.endDistribution()

					handleTx(endDistribution, `Distribution: End Distribution`)
				}}
			>
				End Distribution
			</Button>
		</>
	)
}

export default Migration
