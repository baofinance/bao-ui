/* eslint-disable react/no-unescaped-entities */
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { BaoDistribution } from '@/typechain/BaoDistribution'
//import { useWeb3React } from '@web3-react/core'
import useDistributionInfo from '@/hooks/distribution/useDistributionInfo'
import useClaimable from '@/hooks/distribution/useClaimable'
import { getDisplayBalance } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import 'katex/dist/katex.min.css'
import Image from 'next/future/image'
import React from 'react'
import Latex from 'react-latex-next'

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()
	const distribution = useContract<BaoDistribution>('BaoDistribution')
	const distributionInfo = useDistributionInfo()
	const claimable = useClaimable()

	let lastClaim = 'Never'
	if (distributionInfo && !distributionInfo.dateStarted.eq(distributionInfo.lastClaim)) {
		lastClaim = new Date(distributionInfo.lastClaim.mul(1000).toNumber()).toDateString()
	}

	return (
		<div className='flex flex-col px-4'>
			<div className='flex flex-col items-center'>
				<Typography variant='hero' className='my-3 text-center font-bold'>
					Claim
				</Typography>
				<Typography variant='xl' className='text-center font-bold'>
					Pending Unlocked BAO
				</Typography>
				<Typography variant='p' className='mt-5 leading-normal'>
					This option is for those who choose to recieve a liquid distribution of their locked BAO over a 3 year unlock period which began
					when they started their token distribution. Over the course of the 3 years, 100% of your locked tokens will be distributed to you
					along the distribution curve defined below.
				</Typography>
				<div className='m-auto mt-4 flex flex-col items-center justify-center'>
					<Image
						width={624}
						height={243}
						src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/672bf049e86f377e5129b84931bba7933e324bcc.png'
						className='h-[200px] rounded'
						alt='Distribution function'
					/>
				</div>
				<Typography variant='xs' className='my-4 rounded bg-background-100 p-2 text-center text-text-200'>
					This graph shows how someone's distribution of locked BAO tokens will unlock over time following.
				</Typography>
				<Typography variant='p' className='mt-2 leading-normal'>
					You may use the button on this page to claim any pending unlocked BAO as often as you like throughout the unlock period. Unlocked
					tokens claimed from your distribution using this method are <b className='font-bold'>not</b> subject to a slashing penalty. You
					may choose to claim your accrued BAO any number of times and then still choose to migrate and lock the remainder of your
					distribution into veBAO, or end your distribution any time during the 3 year unlock period. However, note that if you choose to
					migrate and lock or end your distribution early, you cannot come back to this page and claim tokens along the distribution curve.
				</Typography>

				<div className='m-auto mt-5 flex flex-col text-2xl'>
					<Latex>{`\\(P_u = Percent \\ Unlocked \\)`}</Latex>
					<Latex>{`\\(x = Days \\)`}</Latex>
					<Latex>{`\\(P_{u}(x) \\begin{cases} \\begin{matrix} (\\frac{2x}{219})^2 & 0 \\leq x \\leq 1095 \\\\ 100 & x > 1095 \\end{matrix} \\end{cases} \\)`}</Latex>
				</div>
				<Typography variant='xs' className='my-4 w-3/5 rounded bg-background-100 p-2 text-center text-text-200'>
					The forumla which determines how many tokens you may claim from your distribution at a given moment in time.
				</Typography>
			</div>

			<div className='flex flex-col items-center'>
				<div className='flex flex-col'>
					<div className='my-5 flex w-full flex-row items-center justify-center gap-4'>
						<div className='flex flex-col gap-2'>
							<Typography variant='lg' className='text-md px-2 font-bold text-text-100'>
								Claimable BAO:
							</Typography>
							<div className='flex h-8 flex-row items-center justify-center gap-2 rounded px-2 py-4'>
								<Image src='/images/tokens/BAO.png' height={24} width={24} alt='BAO' />
								<Typography variant='base' className='font-semibold'>
									{getDisplayBalance(BigNumber.isBigNumber(claimable) ? claimable : BigNumber.from(0))}
								</Typography>
							</div>
						</div>
						<div className='flex flex-col gap-2 text-center'>
							<Typography variant='lg' className='text-md px-2 font-bold text-text-100'>
								Last Claim:
							</Typography>
							<div className='flex h-8 flex-row items-center justify-center gap-2 rounded px-2 py-4'>
								<Typography variant='base' className='text-md px-2 font-semibold text-text-200'>
									{lastClaim}
								</Typography>
							</div>
						</div>
					</div>
				</div>

				<div className='w-2/5 flex-1'>
					<Button
						className='my-4'
						disabled={!(BigNumber.isBigNumber(claimable) && claimable.gt(0))}
						fullWidth
						onClick={async () => {
							const claim = distribution.claim()
							handleTx(claim, `Distribution: Claim ${formatUnits(claimable as BigNumber)} BAO`)
						}}
					>
						Claim Now
					</Button>
				</div>
			</div>

			<Typography variant='sm' className='m-auto text-text-200'>
				* This action is meant to be done multiple times over three years
			</Typography>
		</div>
	)
}

export default Migration
