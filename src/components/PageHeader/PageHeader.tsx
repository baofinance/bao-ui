import { Icon } from '@/components/Icon'
import React from 'react'

interface PageHeaderProps {
	icon?: any
	description?: any
	title?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, description }) => {
	return (
		<div className='mx-auto mt-6 box-border flex flex-col items-center pb-2'>
			<Icon src={icon} />
			<h1 className='text-center font-kaushan text-xxxl font-medium tracking-tighter text-text-100 antialiased'>{title}</h1>
			<p className='flex flex-1 items-center justify-center'>{description}</p>
		</div>
	)
}

export default PageHeader
