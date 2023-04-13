import { NextSeo } from 'next-seo'
import React from 'react'

import PageHeader from '@/components/PageHeader'

import Card from '@/components/Card'
import Typography from '@/components/Typography'
import Link from 'next/link'
import FarmList from './components/FarmList'

const Farms: React.FC = () => {
	return (
		<>
			<NextSeo title={'Farms'} description={'Stake LP tokens to earn BAO.'} />
			<PageHeader title='Farms' />
			<Card className='flex'>
				<div className='flex-row'>
					<Typography variant='lg' className='mr-2 inline font-bold text-red'>
						Attention:
					</Typography>
					<Typography className='inline'>
						Withdraw your LP tokens and migrate to{' '}
						<Link href='/distribution/'>
							<a className='font-bold hover:text-baoRed'>Gauges</a>
						</Link>{' '}
						if you wish to continue farming BAO. If you didn{"'"}t harvest before the November 19 snapshot of locked BAO, you will only be
						able to migrate the balance you had at the time of the snapshot. Any liquid BAO collected from harvests post-snapshot can be
						swapped with the{' '}
						<Link href='/distribution/'>
							<a className='font-bold hover:text-baoRed'>migration swapper</a>
						</Link>
						.
					</Typography>
				</div>
			</Card>
			<FarmList />
		</>
	)
}

export default Farms
