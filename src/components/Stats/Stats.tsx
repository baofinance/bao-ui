import React from 'react'
import { isDesktop } from 'react-device-detect'
import Typography from '../Typography'

type Stat = {
	label: string
	value: any
}

type StatBlockProps = {
	label?: string
	stats: Stat[]
}

export const StatBlock = ({ label, stats }: StatBlockProps) => (
	<>
		{label && (
			<div className='text-center'>
				<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-3 font-bold text-text-100'>
					{label}
				</Typography>
			</div>
		)}
		<div className='realtive flex min-h-fit min-w-fit flex-1 flex-col rounded-lg bg-primary-100'>
			{stats.map(({ label, value }) => (
				<div className='grid grid-cols-2 break-words rounded-lg px-2 py-2 odd:bg-primary-200' key={label}>
					<Typography variant={`${isDesktop ? 'sm' : 'xs'}`} className='font-medium text-text-100'>
						{label}
					</Typography>
					<Typography variant={`${isDesktop ? 'sm' : 'xs'}`} className='text-end font-medium text-text-100'>
						{value}
					</Typography>
				</div>
			))}
		</div>
	</>
)

export const StatCards = ({ label, stats }: StatBlockProps) => (
	<>
		{label && (
			<div className='text-center'>
				<Typography>{label}</Typography>
			</div>
		)}
		{stats.map(({ label, value }) => (
			<div className='realtive flex min-w-[15%] flex-1 flex-col rounded-lg border border-primary-300 bg-primary-100 px-4 py-3 lg:px-3 lg:py-2'>
				<div className='break-words text-center' key={label}>
					<Typography variant='sm' className='text-text-200'>
						{label}
					</Typography>
					<Typography variant='base' className='font-medium'>
						{value}
					</Typography>
				</div>
			</div>
		))}
	</>
)

export const FeeBlock = ({ label, stats }: StatBlockProps) => (
	<>
		<div className='text-center'>
			<Typography variant='base' className='font-bold text-text-100'>
				{label}
			</Typography>
		</div>
		<div className='realtive flex min-h-fit min-w-fit flex-1 flex-col rounded-lg bg-primary-100'>
			{stats.map(({ label, value }) => (
				<div className='grid grid-cols-2 break-words rounded-lg px-2 py-2 odd:bg-primary-200' key={label}>
					<Typography variant='base' className='font-semibold text-text-100'>
						{label}
					</Typography>
					<Typography variant='base' className='text-end text-text-100'>
						{value}
					</Typography>
				</div>
			))}
		</div>
	</>
)
