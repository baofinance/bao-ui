import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import { Tab } from '@headlessui/react'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import Distribution from './components/Distribution'
import Swapper from './components/Swapper'

const Migration: React.FC = () => {
	return (
		<>
			<NextSeo title={`Migration`} description={`Migrate your BAOv1 to BAOv2!`} />
			<PageHeader title='Migration' />
			<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 text-center font-light tracking-tight'>
				Migrate your BAOv1 to BAOv2!
			</Typography>
			<Tab.Group defaultIndex={0}>
				<Tab.List className='m-auto flex w-fit flex-1 items-center justify-center gap-2 rounded bg-background-100 p-2'>
					<Tab className='border-0 outline-0'>
						{({ selected }) => (
							<button
								className={`rounded !border-none p-2 !outline-0  ${
									selected ? 'border border-primary-300 bg-primary-200 hover:bg-primary-200' : 'bg-none hover:bg-primary-100'
								}`}
							>
								Liquid BAO
							</button>
						)}
					</Tab>
					<Tab className='border-0 outline-0'>
						{({ selected }) => (
							<button
								className={`rounded !border-none p-2 !outline-0  ${
									selected ? 'border border-primary-300 bg-primary-200 hover:bg-primary-200' : 'bg-none hover:bg-primary-100'
								}`}
							>
								Locked BAO
							</button>
						)}
					</Tab>
				</Tab.List>
				<Tab.Panels className='mt-4'>
					<Tab.Panel>
						<Swapper />
					</Tab.Panel>
					<Tab.Panel>
						<Distribution />
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</>
	)
}

export default Migration
