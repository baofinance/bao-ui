import Button, { MaxButton } from '@/components/Button'
import React, { ReactNode } from 'react'
import styled from 'styled-components'

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
}) => {
	return (
		<div className='align-center flex h-12 w-full rounded-lg border-0 bg-primary-400'>
			<div className='align-center relative flex w-full justify-center align-middle'>
				{!!startAdornment && startAdornment}
				<input
					disabled={disabled}
					type='number'
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className='bg-transparent text-default font-strong relative h-12 w-full min-w-0 
				appearance-none rounded-lg border-solid border-inherit pl-4 pr-4 text-start align-middle 
				text-text-100 outline-none outline outline-2 outline-offset-2 transition-all
				 duration-200 disabled:text-text-200 md:text-sm'
				/>
				{!disabled && (
					<>
						<div className='flex h-full items-center justify-center'>
							{onSelectHalf && (
								<Button size='xs' onClick={onSelectHalf} className='mr-1'>
									½
								</Button>
							)}
							<Button size='xs' onClick={onSelectMax} className='mr-1'>
								MAX
							</Button>
						</div>
					</>
				)}
				{!!endAdornment && endAdornment}
			</div>
			{typeof label === 'string' ? <p>{label}</p> : label}
		</div>
	)
}

const StyledInputWrapper = styled.div`
	align-items: center;
	background: ${props => props.theme.color.primary[400]};
	border-radius: ${props => props.theme.borderRadius}px;
	display: flex;
	height: 50px;
	padding: 0 ${props => props.theme.spacing[3]}px;
`

const StyledInput = styled.input`
	width: 100%;
	min-width: 0px;
	outline-offset: 2px;
	position: relative;
	appearance: none;
	transition-property: all;
	transition-duration: 200ms;
	font-size: 1rem;
	height: 50px;
	text-align: start;
	font-weight: ${props => props.theme.fontWeight.medium};
	padding-right: 0.5rem;
	outline: transparent solid 2px;
	border-radius: 8px;
	border-style: solid;
	border-image: initial;
	border-color: inherit;
	color: ${props => props.theme.color.text[100]};
	background: none;
	background-color: transparent;
	border-width: 0px;

	&:disabled {
		color: ${props => props.theme.color.text[200]};
	}

	@media (max-width: ${props => props.theme.breakpoints.md}px) {
		font-size: 0.875rem;
	}
`

export default Input

export interface BalanceInputProps extends InputProps {
	label?: ReactNode
	onMaxClick: (e: any) => void
	disabled?: boolean
}

export const BalanceInput = ({ value, label, onChange, onMaxClick, disabled }: BalanceInputProps) => (
	<div className='align-center flex h-12 w-full rounded-lg border-0 bg-primary-400'>
		<div className='align-center relative flex w-full'>
			<Input value={value} onChange={onChange} placeholder='0' disabled={disabled} />
			{!disabled && <MaxButton onClick={onMaxClick} />}
		</div>
		{typeof label === 'string' ? <p>{label}</p> : label}
	</div>
)

export const InputStack = styled.div`
	display: flex;
	-webkit-box-align: center;
	align-items: center;
	flex-direction: column;
	margin-top: 1rem;
	margin-inline: 0px;
	margin-bottom: 0px;
`
