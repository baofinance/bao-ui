import classNames from 'classnames'
import Typography from '../Typography'

type Stat = {
	label: string
	value: any
}

type StatBlockProps = {
	label?: string
	stats: Stat[]
	className?: string
}

export const StatBlock = ({ label, stats, className = '' }: StatBlockProps) => (
	<>
		<div className={classNames('', className)}>
			{label && (
				<div className='text-center'>
					<Typography variant='lg' className='mb-3 font-bold text-baoWhite'>
						{label}
					</Typography>
				</div>
			)}
			<div className='realtive flex min-h-fit min-w-fit flex-1 flex-col rounded bg-primary-100'>
				{stats.map(({ label, value }) => (
					<div className='grid grid-cols-2 break-words rounded px-3 py-3 odd:bg-primary-200' key={label}>
						<Typography variant='base' className=' text-baoWhite'>
							{label}
						</Typography>
						<Typography variant='base' className='text-end text-baoWhite'>
							{value}
						</Typography>
					</div>
				))}
			</div>
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
			<div key={label} className='realtive flex min-w-[15%] flex-1 flex-col rounded border text-transparent-200 bg-primary-100 px-4 py-3'>
				<div className='break-words text-center' key={label}>
					<Typography variant='sm' className='mb-1 text-left text-baoRed'>
						{label}
					</Typography>
					<Typography variant='base' className='text-left font-semibold'>
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
			<Typography variant='base' className='font-bold text-baoWhite'>
				{label}
			</Typography>
		</div>
		<div className='realtive flex min-h-fit min-w-fit flex-1 flex-col rounded bg-primary-100 p-2'>
			{stats.map(({ label, value }) => (
				<div className='grid grid-cols-2 break-words rounded px-2 py-2 odd:bg-primary-200' key={label}>
					<Typography variant='base' className='font-semibold text-baoWhite'>
						{label}
					</Typography>
					<Typography variant='base' className='text-end text-baoWhite'>
						{value}
					</Typography>
				</div>
			))}
		</div>
	</>
)
