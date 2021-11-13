import React from 'react'
import styled from 'styled-components'

export interface InputProps {
	onChange: (e: React.FormEvent<HTMLInputElement>) => void
	placeholder?: string
	value: string
}

export const Input: React.FC<InputProps> = ({ onChange, placeholder, value }) => {
	return (
			<StyledInput/>
	)
}

export interface NestInputProps extends InputProps {
	endAdornment?: React.ReactNode
	startAdornment?: React.ReactNode
}

export const NestInput: React.FC<NestInputProps> = ({
	endAdornment,
	onChange,
	placeholder,
	startAdornment,
	value,
}) => {
	return (
		<NestInputWrapper>
			{!!startAdornment && startAdornment}
			<StyledInput
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
			{!!endAdornment && endAdornment}
		</NestInputWrapper>
	)
}

const NestInputWrapper = styled.div`
	align-items: center;
	background: ${(props) => props.theme.color.transparent[100]};
	border-radius: ${(props) => props.theme.borderRadius}px;
	display: flex;
	height: 72px;
	padding: 0 ${(props) => props.theme.spacing[3]}px;
`

const StyledInputWrapper = styled.div`
	align-items: center;
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
    height: 2.5rem;
    text-align: end;
    font-weight: ${(props) => props.theme.fontWeight.medium};
    padding-top: ;
    padding-bottom: ;
    padding-left: ;
    padding-right: .5rem;
    outline: transparent solid 2px;
    border-radius: 8px;
    border-style: solid;
    border-image: initial;
    border-color: inherit;
	color: ${(props) => props.theme.color.text[100]};
	background: none;
    background-color: transparent;
    border-width: 0px;
`

export default NestInput

export interface BalanceInputProps extends InputProps {
	label?: React.ReactNode
	onMaxClick: (e: any) => void
}

export const BalanceInput = ({
	value,
	label,
	onChange,
	onMaxClick,
}: BalanceInputProps) => (
	<BalanceInputContainer>
		<BalanceInputWrapper>
			<BalanceInputMax onClick={onMaxClick}>MAX</BalanceInputMax>
			<Input value={value} onChange={onChange} placeholder="0" />
		</BalanceInputWrapper>
		{typeof label === 'string' ? <p>{label}</p> : label}
	</BalanceInputContainer>
)

const BalanceInputContainer = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	background-color: ${(props) => props.theme.color.transparent[100]};
	border-radius: 8px;
`

const BalanceInputWrapper = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	position: relative;
`

const BalanceInputMax = styled.div`
	display: flex;
	cursor: pointer;
	position: absolute;
	left: 0px;
	font-weight: ${(props) => props.theme.fontWeight.strong};
	font-size: 0.875rem;
	margin-left: 1rem;
	color: ${(props) => props.theme.color.text[200]};
	z-index: 10;

	&:hover {
		color: ${(props) => props.theme.color.text[100]};
	}
`
