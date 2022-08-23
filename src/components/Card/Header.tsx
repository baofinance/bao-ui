import Typography from '@/components/Typography'
import React, { FC, ReactNode } from 'react'

export interface CardHeaderProps {
	children?: any
	header?: string | ReactNode
	subheader?: string
}

const CardHeader: FC<CardHeaderProps> = ({ header, subheader, children }) => {
	return (
		<div className='flex justify-between'>
			<div className='mb-2 flex flex-col items-center justify-center gap-1'>
				<Typography className='flex gap-3 text-text-100 font-bold'>
					{header}
					{children}
				</Typography>
				{subheader && <Typography variant='sm'>{subheader}</Typography>}
			</div>
		</div>
	)
}

export default CardHeader
