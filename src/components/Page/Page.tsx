import React, { PropsWithChildren } from 'react'

import Footer from '@/components/Footer'

import Container from '../Container'

interface PageProps {
	children: any
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({ children }) => (
	<>
		<div className='app-layer'>
			<div className='top-0 w-full'>{children}</div>
		</div>
	</>
)

export default Page
