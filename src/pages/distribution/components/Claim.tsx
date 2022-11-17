/* eslint-disable react/no-unescaped-entities */
import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import useClaimable from '@/hooks/distribution/useClaimable'
import { BaoDistribution } from '@/typechain/BaoDistribution'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import 'katex/dist/katex.min.css'
import Image from 'next/future/image'
import React from 'react'
import Latex from 'react-latex-next'

const Migration: React.FC = () => {
	const { handleTx } = useTransactionHandler()

	const distribution = useContract<BaoDistribution>('BaoDistribution')

	const { account, chainId } = useWeb3React()
	const { data: distributionInfo, refetch } = useQuery(
		['distribution info', account, chainId],
		async () => {
			return await distribution.distributions(account)
		},
		{
			enabled: !!distribution && !!account,
		},
	)
	useTxReceiptUpdater(refetch)
	useBlockUpdater(refetch, 10)

	//console.log('User has started distrubtion.', distributionInfo && distributionInfo.dateStarted.gt(0))

	const claimable = useClaimable()
	//const dateStarted = distributionInfo ? distributionInfo.dateStarted : 0
	//console.log('Claimable', formatUnits(claimable))
	//console.log('Date Started', dateStarted.toString())

	return (
		<div className='flex flex-col px-4'>
			<div className='flex flex-col items-center'>
				<Typography variant='hero' className='my-3 text-center font-bold'>
					Claim
				</Typography>
				<Typography variant='xl' className='text-center font-bold'>
					Pending unlocked BAO from your distribution
				</Typography>
				<Typography variant='p' className='my-5 leading-normal'>
					This option is for those who choose to recieve a liquid distribution of their locked BAO over a 3 year unlock period which began
					when they started their token distribution. Over the course of the 3 years, 100% of your locked tokens will be distributed to you
					along the distribution curve defined below.
					<br />
					<br />
					You may use the button on this page to claim any awaiting newly-unlocked BAO as often as you like throughout this unlock period,
					as long as enough time has past for you to have accrued more tokens since your last claim.
					<br />
					<br />
					The unlocked tokens claimed from your distribution using this method are *NOT* subject to the slashing penalty that the "End
					Distribution" option has. Also, you may choose this option to claim your accrued tokens any number of times and then still choose
					still choose to migrate and lock the remainder of your distribution into veBAO or end your distribution at any time during the 3
					year unlock period. However, note that if you choose to migrate and lock or end your distribution early, you will be unable to
					come back to this page and claim tokens along the distribution curve.
				</Typography>

				<div className='m-auto flex flex-col text-2xl'>
					<Latex>{`\\(P_u = Percent \\ Unlocked \\)`}</Latex>
					<Latex>{`\\(x = Days \\)`}</Latex>
					<div className='h-2' />
					<Latex>{`\\(P_{u}(x) \\begin{cases} \\begin{matrix} (\\frac{2x}{219})^2 & 0 \\leq x \\leq 1095 \\\\ 100 & x > 1095 \\end{matrix} \\end{cases} \\)`}</Latex>
				</div>
				<Typography variant='sm' className='my-2 w-3/5 text-center text-text-200'>
					This math determines how many tokens you may claim from your distribution at a given moment in time.
				</Typography>

				<div className='m-auto mt-4 flex flex-col items-center justify-center'>
					<Image
						width={624}
						height={243}
						src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/672bf049e86f377e5129b84931bba7933e324bcc.png'
						className='h-[200px] rounded'
						alt='Distribution function'
					/>
					<Typography variant='sm' className='my-2 w-3/5 text-center text-text-200'>
						This graph shows how someone's distribution of locked BAO tokens will unlock over time following.
					</Typography>
				</div>
			</div>

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

			<div className='flex flex-col items-center'>
				<div className='w-2/5 flex-1'>
					<Button
						className='my-4'
						disabled={!(claimable instanceof BigNumber && claimable.gt(0))}
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

			<Typography variant='sm' className='text-right text-text-200'>
				* This action is meant to be done multiple times over three years :)
			</Typography>
		</div>
	)
}

export default Migration
