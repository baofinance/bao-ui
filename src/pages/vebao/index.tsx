import PageHeader from '@/components/PageHeader'
import Typography from '@/components/Typography'
import { Tab, TabPanel, Tabs, TabsBody, TabsHeader } from '@material-tailwind/react'
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
			<Tabs value='lock'>
				<TabsHeader>
					<Tab key='lock' value='lock'>
						Lock
					</Tab>
					<Tab key='vote' value='vote'>
						Vote
					</Tab>

					<Tab key='gauuges' value='gauges'>
						Gauges
					</Tab>
				</TabsHeader>
				<TabsBody>
					<TabPanel key='lock' value='lock'>
						<Lock />
					</TabPanel>
					<TabPanel key='vote' value='vote'>
						<Vote />
					</TabPanel>
					<TabPanel key='gauges' value='gauges'>
						<Gauges />
					</TabPanel>
				</TabsBody>
			</Tabs>
		</>
	)
}

export default veBAO
