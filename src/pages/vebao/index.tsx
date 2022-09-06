import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import { Tab } from '@headlessui/react'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import Gauges from './components/Gauges'
import Lock from './components/Lock'
import Vote from './components/Vote'

const veBAO: React.FC = () => {
	return (
		<>
			<NextSeo title={`veBAO`} description={`Lock your BAO for veBAO!`} />
			<PageHeader title='veBAO' />
			<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
				Lock your BAO for veBAO!
			</Typography>
			<Tab.Group defaultIndex={0}>
				<Tab.List className='m-auto flex w-fit flex-1 items-center justify-center gap-2 rounded-lg bg-background-100 p-2'>
					<Tab className='border-0 outline-0'>
						{({ selected }) => (
							<button
								className={`rounded-lg !border-none p-2 !outline-0  ${
									selected ? 'border border-primary-300 bg-primary-200 hover:bg-primary-200' : 'bg-none hover:bg-primary-100'
								}`}
							>
								Lock
							</button>
						)}
					</Tab>
					<Tab className='border-0 outline-0'>
						{({ selected }) => (
							<button
								className={`rounded-lg !border-none p-2 !outline-0 ${
									selected ? 'border border-primary-300 bg-primary-200 hover:bg-primary-200' : 'bg-none hover:bg-primary-100'
								}`}
							>
								Vote
							</button>
						)}
					</Tab>
					<Tab className='border-0 outline-0'>
						{({ selected }) => (
							<button
								className={`rounded-lg !border-none p-2 !outline-0  ${
									selected ? 'border border-primary-300 bg-primary-200 hover:bg-primary-200' : 'bg-none hover:bg-primary-100'
								}`}
							>
								Gauges
							</button>
						)}
					</Tab>
				</Tab.List>
				<Tab.Panels className='mt-4'>
					<Tab.Panel>
						<Lock />
					</Tab.Panel>
					<Tab.Panel>
						<Vote />
					</Tab.Panel>
					<Tab.Panel>
						<Gauges />
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</>
	)
}

export default veBAO
