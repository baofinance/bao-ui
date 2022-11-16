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

	console.log('User has started distrubtion.', distributionInfo && distributionInfo.dateStarted.gt(0))

	const claimable = useClaimable()
	const dateStarted = distributionInfo ? distributionInfo.dateStarted : 0
	console.log('Claimable', formatUnits(claimable))
	console.log('Date Started', dateStarted.toString())

	return (
		<>
			<div className='flex flex-col'></div>
			<div className='flex flex-col'>
				<div className='flex flex-row'>
					<Typography variant='p'>
						Choose to perform a liquid distribution over 3 years. Over the course of the 3 years, 100% of your locked tokens will be
						distributed to you along the distribution curve defined below. You can claim as many times as you would like throughout this
						distribution, as long as you have accrued more tokens since your last claim. All tokens claimed using this method are not
						subject to any slashing penalty. You may still choose to lock into veBAO or end your distribution at any time during the 3 year
						period.
					</Typography>
				</div>
				<div className='m-auto flex flex-col'>
					<Latex>{`\\(P_u = Percent \\ Unlocked \\)`}</Latex>
					<Latex>{`\\(x = Days \\)`}</Latex>
					<div className='h-2' />
					<Latex>{`\\(P_{u}(x) \\begin{cases} \\begin{matrix} (\\frac{2x}{219})^2 & 0 \\leq x \\leq 1095 \\\\ 100 & x > 1095 \\end{matrix} \\end{cases} \\)`}</Latex>
				</div>
				<div className='m-auto mt-4 flex w-1/2 flex-col items-center justify-center'>
					<Image
						width={624}
						height={243}
						src='https://global.discourse-cdn.com/standard10/uploads/bao/original/1X/672bf049e86f377e5129b84931bba7933e324bcc.png'
						className='h-[200px] rounded'
						alt='Distribution function'
					/>
					<Typography variant='xs' className='mt-2 text-center text-text-200'>
						A graph showing how BAO will unlock over time following.
					</Typography>
				</div>
			</div>
			<Button
				fullWidth
				onClick={async () => {
					const claim = distribution.claim()

					handleTx(claim, `Distribution: Claim ${formatUnits(claimable)} BAO`)
				}}
			>
				Claim Now
			</Button>
		</>
	)
}

export default Migration
