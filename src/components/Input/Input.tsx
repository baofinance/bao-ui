import { MaxButton } from 'components/Button'
import React from 'react'
import styled from 'styled-components'

export interface InputProps {
	onChange: (e: React.FormEvent<HTMLInputElement>) => void
	placeholder?: string
	value: string
}

export interface BasketInputProps extends InputProps {
	endAdornment?: React.ReactNode
	startAdornment?: React.ReactNode
}

export const BasketInput: React.FC<BasketInputProps> = ({
	endAdornment,
	onChange,
	placeholder,
	startAdornment,
	value,
}) => {
	return (
		<BasketInputWrapper>
			{!!startAdornment && startAdornment}
			<StyledInput
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
			{!!endAdornment && endAdornment}
		</BasketInputWrapper>
	)
}

const BasketInputWrapper = styled.div`
	align-items: center;
	background: ${(props) => props.theme.color.primary[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;
	display: flex;
	height: 72px;
	padding: 0 ${(props) => props.theme.spacing[3]}px;
`

const StyledInput = styled.input`
	width: 100%;
	min-width: 0px;
	outline-offset: 2px;
	position: relative;
	appearance: none;
	transition-property: all;
	transition-duration: 200ms;
	font-size: 1.125rem;
	padding-inline-start: 1rem;
	padding-inline-end: 1rem;
	height: 50px;
	text-align: start;
	font-weight: ${(props) => props.theme.fontWeight.medium};
	padding-right: 0.5rem;
	outline: transparent solid 2px;
	border-radius: 8px;
	border-style: solid;
	border-image: initial;
	border-color: inherit;
	color: ${(props) => props.theme.color.text[100]};
	background: none;
	background-color: transparent;
	border-width: 0px;
	
	&:disabled {
		color: ${(props) => props.theme.color.text[200]};
	}
`

export default BasketInput

export interface BalanceInputProps extends InputProps {
	label?: React.ReactNode
	onMaxClick: (e: any) => void
	disabled?: boolean
}

export const BalanceInput = ({
	value,
	label,
	onChange,
	onMaxClick,
	disabled,
}: BalanceInputProps) => (
	<BalanceInputContainer>
		<BalanceInputWrapper>
			<StyledInput
				value={value}
				onChange={onChange}
				placeholder="0"
				disabled={disabled}
			/>
			{!disabled && <MaxButton onClick={onMaxClick}>MAX</MaxButton>}
		</BalanceInputWrapper>
		{typeof label === 'string' ? <p>{label}</p> : label}
	</BalanceInputContainer>
)

const BalanceInputContainer = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	background-color: ${(props) => props.theme.color.primary[200]};
	border-radius: 8px;
	height: 50px;
	border: ${(props) => props.theme.border.default};
`

const BalanceInputWrapper = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	position: relative;
`
