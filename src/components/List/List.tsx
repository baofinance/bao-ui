import React from 'react'
import { isDesktop } from 'react-device-detect'
import Typography from '../Typography'

type ListHeaderProps = {
	headers: string[]
}

export const ListHeader: React.FC<ListHeaderProps> = ({ headers }: ListHeaderProps) => {
	return (
		<div className='flex flex-row px-2 py-3'>
			{headers.map((header: string) => (
				<Typography
					variant={`${isDesktop ? 'base' : 'xs'}`}
					className='flex w-full flex-col pb-0 text-center font-bold first:items-start last:items-end'
					key={header}
				>
					{header}
				</Typography>
			))}
		</div>
	)
}
