import React, { ReactNode } from 'react'

import Button from '@/components/Button'
import classNames from 'classnames'
import Typography from '../Typography'

export interface InputProps {
	endAdornment?: ReactNode
	onChange: (e: React.FormEvent<HTMLInputElement>) => void
	placeholder?: string
	startAdornment?: ReactNode
	value: string | undefined
	label?: ReactNode
	disabled?: boolean
	max?: number | string
	symbol?: string
	onSelectMax?: () => void
	onSelectHalf?: () => void
	className?: string
}

const Input: React.FC<InputProps> = ({
	label,
	disabled,
	onSelectMax,
	onSelectHalf,
	endAdornment,
	onChange,
	placeholder,
	startAdornment,
	value,
	className,
}) => {
	return (
		<div className={'align-center flex w-full rounded-3xl border border-baoWhite border-opacity-20'}>
			<div className='align-center relative flex w-full justify-center align-middle'>
				{!!startAdornment && startAdornment}
				<input
					disabled={disabled}
					type='number'
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className={classNames(
						'relative w-full min-w-0 appearance-none rounded-3xl rounded-r-3xl border-solid border-inherit bg-baoBlack py-3 pl-4 text-start align-middle text-base text-baoWhite outline-none outline outline-2 outline-offset-2 transition-all duration-200 disabled:text-opacity-60',
						className,
					)}
				/>
				{!disabled && (
					<>
						{onSelectMax && (
							<div className='flex h-full items-center justify-center rounded-r-3xl bg-baoBlack'>
								<Button onClick={onSelectMax} className='mr-1 !rounded-full border border-baoRed !p-1 lg:mr-2 lg:!p-2' size='xs'>
									<Typography className='font-bakbak text-sm font-normal text-baoWhite lg:text-base'>MAX</Typography>
								</Button>
							</div>
						)}
					</>
				)}
				{!!endAdornment && endAdornment}
			</div>
			{typeof label === 'string' ? <p>{label}</p> : label}
		</div>
	)
}

export default Input
