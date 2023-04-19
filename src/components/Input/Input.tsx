import React, { ReactNode } from 'react'

import Button from '@/components/Button'
import classNames from 'classnames'

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
		<div className={classNames('align-center flex w-full rounded border-0', className)}>
			<div className='align-center relative flex w-full justify-center align-middle'>
				{!!startAdornment && startAdornment}
				<input
					disabled={disabled}
					type='number'
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className='relative
				w-full min-w-0 appearance-none rounded border-solid border-inherit bg-baoBlack px-4 py-2
				text-start align-middle text-base outline-none outline
				 outline-2 outline-offset-2 transition-all duration-200 disabled:text-baoRed'
				/>
				{!disabled && (
					<>
						{onSelectMax && (
							<div className='flex h-full items-center justify-center rounded-r-lg bg-baoBlack px-4 py-2'>
								<Button onClick={onSelectMax} className='!rounded-full border border-baoRed p-4' size='xs'>
									MAX
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
