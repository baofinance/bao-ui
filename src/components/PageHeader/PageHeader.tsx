import { Icon } from '@/components/Icon'
import React from 'react'
import Typography from '../Typography'

interface PageHeaderProps {
	icon?: any
	description?: any
	title?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, description }) => {
	return (
		<div className='mx-auto mb-4 mt-6 box-border flex flex-col items-center'>
			<Icon src={icon} />
			<Typography variant='hero' className='antialiased'>
				{title}
			</Typography>
			{description && <Typography className='flex flex-1 items-center justify-center'>{description}</Typography>}
		</div>
	)
}

export default PageHeader
