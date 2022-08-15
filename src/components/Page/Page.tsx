import Footer from '@/components/Footer'
import React, { PropsWithChildren } from 'react'

interface PageProps {
	children: any
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({ children }) => (
	<div className='mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8'>
		<div className='flex min-h-[calc(100vh-240px)] flex-col items-center'>{children}</div>
		<Footer />
	</div>
)

export default Page
