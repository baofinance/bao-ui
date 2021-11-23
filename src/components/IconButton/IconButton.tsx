import { lighten } from 'polished'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface IconButtonProps {
	children?: React.ReactNode
	disabled?: boolean
	onClick?: () => void
	to?: string
}

const IconButton: React.FC<IconButtonProps> = ({
	children,
	disabled,
	onClick,
	to,
}) => {
	return (
		<StyledButton disabled={disabled} onClick={onClick}>
			{to ? <StyledLink to={to}>{children}</StyledLink> : children}
		</StyledButton>
	)
}

interface StyledButtonProps {
	disabled?: boolean
}

const StyledButton = styled.button<StyledButtonProps>`
	align-items: center;
	background: ${(props) => props.theme.color.primary[100]};
	border: none;
	box-shadow: ${(props) => props.theme.boxShadow.default};
	border-radius: 32px;
	color: ${(props) => props.theme.color.text[100]};
	cursor: pointer;
	display: flex;
	font-weight: ${(props) => props.theme.fontWeight.strong};
	height: 50px;
	justify-content: center;
	letter-spacing: 1px;
	outline: none;
	padding: 0;
	margin: 0;
	pointer-events: ${(props) => (!props.disabled ? undefined : 'none')};
	text-transform: uppercase;
	width: 50px;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	position: relative;
	transition: .5s;
	overflow: hidden;

	&:focus {
		outline: 0;
	}

	  &:hover{
		background: ${(props) => props.theme.color.primary[100]};
		box-shadow: ${(props) => props.theme.boxShadow.hover};
		color: ${(props) => props.theme.color.text[400]};
		cursor: pointer;
	  }
	}

	&:hover,
	&:focus,
	&:active {
		box-shadow: ${(props) => props.theme.boxShadow.hover};
		cursor: ${(props) =>
			props.disabled ? 'not-allowed' : 'pointer'} !important;
	}
`

const StyledLink = styled(Link)`
	align-items: center;
	color: ${(props) => props.theme.color.text[100]};
	display: flex;
	flex: 1;
	height: 56px;
	justify-content: center;
	margin: 0 ${(props) => -props.theme.spacing[4]}px;
	padding: 0 ${(props) => props.theme.spacing[4]}px;
	text-decoration: none;
`

export default IconButton
