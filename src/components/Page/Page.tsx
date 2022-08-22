import Footer from '@/components/Footer'
import React, { PropsWithChildren } from 'react'

interface PageProps {
	children: any
}

const Page: React.FC<PropsWithChildren<PageProps>> = ({ children }) => (
	<div className='absolute top-[72px] left-0 table h-[calc(100vh-72px)] w-full'>
		<div className='top-0 left-0 table-cell min-h-[calc(100vh-72px)] align-middle'>
			<div className='flex min-h-[calc(100vh-240px)] flex-col items-center'>
				<div className='container'>{children}</div>
			</div>
			<Footer />
		</div>
	</div>
)

export default Page
