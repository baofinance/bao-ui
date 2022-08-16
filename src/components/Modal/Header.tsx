import Typography from '@/components/Typography'
import React, { FC, ReactNode } from 'react'

export interface CardHeaderProps {
	header: string | ReactNode
	subheader?: string
}

const CardHeader: FC<CardHeaderProps> = ({ header, subheader }) => {
	return (
		<div className='flex justify-between'>
			<div className='mb-2 flex flex-col items-center justify-center gap-1'>
				<Typography weight={700} className='flex gap-3 text-text-100'>
					{header}
				</Typography>
				{subheader && <Typography variant='sm'>{subheader}</Typography>}
			</div>
		</div>
	)
}

export default CardHeader
